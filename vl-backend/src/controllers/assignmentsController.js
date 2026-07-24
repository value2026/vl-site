const prisma = require('../db');

// ── TEACHER ENDPOINTS ──────────────────────────────────────────

// GET /api/assignments/papers
const getPapers = async (req, res) => {
  try {
    const { id: teacherId } = req.user;

    const papers = await prisma.questionPaper.findMany({
      where: { createdById: teacherId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(papers);
  } catch (err) {
    console.error('Get papers error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/assignments/papers
const createPaper = async (req, res) => {
  try {
    const { id: teacherId } = req.user;
    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'title and questions array are required' });
    }

    // Validate structure of questions
    for (const q of questions) {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || typeof q.correctOptionIndex !== 'number') {
        return res.status(400).json({ message: 'Invalid question structure. Must contain questionText, options (min 2), and correctOptionIndex.' });
      }
    }

    const paper = await prisma.questionPaper.create({
      data: {
        title: title.trim(),
        questions,
        createdById: teacherId
      }
    });

    res.status(201).json(paper);
  } catch (err) {
    console.error('Create paper error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/assignments/papers/:id
const deletePaper = async (req, res) => {
  try {
    const { id: teacherId } = req.user;
    const { id } = req.params;

    const paper = await prisma.questionPaper.findFirst({
      where: { id, createdById: teacherId }
    });

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found' });
    }

    await prisma.questionPaper.delete({ where: { id } });
    res.json({ message: 'Question paper deleted successfully' });
  } catch (err) {
    console.error('Delete paper error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/assignments/active-assignments
const getActiveAssignments = async (req, res) => {
  try {
    const { id: teacherId } = req.user;

    const list = await prisma.assignment.findMany({
      where: { teacherId },
      include: {
        questionPaper: { select: { title: true, questions: true } },
        students: {
          include: {
            student: { select: { name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(list);
  } catch (err) {
    console.error('Get active assignments error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/assignments/schedule
const scheduleAssignment = async (req, res) => {
  try {
    const { id: teacherId } = req.user;
    const { title, questionPaperId, startTime, endTime, maxAttempts, resultDisplay, studentIds } = req.body;

    if (!title || !questionPaperId || !startTime || !endTime || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'title, questionPaperId, startTime, endTime, and studentIds (array) are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date format' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Verify paper exists and belongs to/is accessible
    const paper = await prisma.questionPaper.findUnique({
      where: { id: questionPaperId }
    });

    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found' });
    }

    // Create assignment and link students in a transaction
    const assignment = await prisma.$transaction(async (tx) => {
      const created = await tx.assignment.create({
        data: {
          title: title.trim(),
          startTime: start,
          endTime: end,
          maxAttempts: parseInt(maxAttempts, 10) || 1,
          resultDisplay: resultDisplay || 'immediate',
          questionPaperId,
          teacherId,
          students: {
            create: studentIds.map(uid => ({ studentId: uid }))
          }
        }
      });

      // Dispatch notification to students
      const formattedDate = start.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      await tx.notification.createMany({
        data: studentIds.map(uid => ({
          userId: uid,
          title: 'New Exam Scheduled',
          message: `Exam '${title.trim()}' has been scheduled for you. Date: ${formattedDate}.`,
          type: 'exam_reminder'
        }))
      });

      return created;
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error('Schedule assignment error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/assignments/remind/:id
const sendReminder = async (req, res) => {
  try {
    const { id: teacherId } = req.user;
    const { id } = req.params;

    const assignment = await prisma.assignment.findFirst({
      where: { id, teacherId },
      include: { students: true }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const studentIds = assignment.students.map(s => s.studentId);
    if (studentIds.length === 0) {
      return res.json({ message: 'No students assigned to this slot' });
    }

    const formattedDate = new Date(assignment.startTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    await prisma.notification.createMany({
      data: studentIds.map(uid => ({
        userId: uid,
        title: 'Upcoming Exam Reminder',
        message: `Reminder: You have an upcoming exam '${assignment.title}' starting on ${formattedDate}.`,
        type: 'exam_reminder'
      }))
    });

    res.json({ message: 'Reminders sent successfully to students' });
  } catch (err) {
    console.error('Send reminder error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/assignments/publish/:id
const publishResults = async (req, res) => {
  try {
    const { id: teacherId } = req.user;
    const { id } = req.params;

    const assignment = await prisma.assignment.findFirst({
      where: { id, teacherId },
      include: { students: true }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const updated = await prisma.assignment.update({
      where: { id },
      data: { resultsPublished: true }
    });

    const studentIds = assignment.students.map(s => s.studentId);
    if (studentIds.length > 0) {
      await prisma.notification.createMany({
        data: studentIds.map(uid => ({
          userId: uid,
          title: 'Exam Results Released',
          message: `Results for your exam '${assignment.title}' have been published. Check your score now!`,
          type: 'info'
        }))
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Publish results error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/assignments/report/:id
const getAssignmentReport = async (req, res) => {
  try {
    const { id: teacherId } = req.user;
    const { id } = req.params;

    const assignment = await prisma.assignment.findFirst({
      where: { id, teacherId },
      include: {
        questionPaper: { select: { title: true, questions: true } },
        students: {
          include: {
            student: { select: { id: true, name: true, email: true } }
          }
        },
        attempts: {
          include: {
            student: { select: { name: true, email: true } }
          },
          orderBy: { completedAt: 'desc' }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (err) {
    console.error('Get assignment report error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/assignments/attempts/:attemptId
const resetAttempt = async (req, res) => {
  try {
    const { id: teacherId } = req.user;
    const { attemptId } = req.params;

    // Verify attempt exists and belongs to teacher's scheduled assignment
    const attempt = await prisma.assignmentAttempt.findUnique({
      where: { id: attemptId },
      include: { assignment: true }
    });

    if (!attempt || attempt.assignment.teacherId !== teacherId) {
      return res.status(404).json({ message: 'Attempt log not found' });
    }

    await prisma.assignmentAttempt.delete({ where: { id: attemptId } });
    res.json({ message: 'Student attempt reset successfully' });
  } catch (err) {
    console.error('Reset attempt error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ── STUDENT ENDPOINTS ──────────────────────────────────────────

// GET /api/assignments/my-assignments
const getMyAssignments = async (req, res) => {
  try {
    const { id: studentId } = req.user;

    const assignedRelations = await prisma.assignmentStudent.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: {
            questionPaper: { select: { title: true, questions: true } },
            teacher: { select: { name: true } },
            attempts: {
              where: { studentId }
            }
          }
        }
      },
      orderBy: { assignment: { startTime: 'asc' } }
    });

    const now = new Date();
    const formatted = assignedRelations.map(rel => {
      const a = rel.assignment;
      const start = new Date(a.startTime);
      const end = new Date(a.endTime);

      let status = 'active';
      if (now < start) {
        status = 'yet_to_start';
      } else if (now > end) {
        status = 'session_over';
      } else if (a.attempts.length >= a.maxAttempts) {
        status = 'completed';
      }

      // Hide scores if manual release and not published yet
      const showResults = a.resultDisplay === 'immediate' || a.resultsPublished;
      const latestAttempt = a.attempts[0] || null;

      return {
        id: a.id,
        title: a.title,
        paperTitle: a.questionPaper.title,
        questionCount: Array.isArray(a.questionPaper.questions) ? a.questionPaper.questions.length : 0,
        startTime: a.startTime,
        endTime: a.endTime,
        maxAttempts: a.maxAttempts,
        attemptsCount: a.attempts.length,
        teacherName: a.teacher.name,
        status,
        resultsPublished: a.resultsPublished,
        score: showResults && latestAttempt ? latestAttempt.score : null,
        maxScore: showResults && latestAttempt ? latestAttempt.maxScore : null,
        completedAt: latestAttempt ? latestAttempt.completedAt : null
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error('Get my assignments error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/assignments/take/:id
const takeAssignment = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const { id } = req.params;

    // Verify student is assigned to this assignment
    const relation = await prisma.assignmentStudent.findUnique({
      where: { assignmentId_studentId: { assignmentId: id, studentId } },
      include: {
        assignment: {
          include: {
            questionPaper: true,
            attempts: { where: { studentId } }
          }
        }
      }
    });

    if (!relation) {
      return res.status(403).json({ message: 'You are not assigned to this assignment' });
    }

    const a = relation.assignment;
    const now = new Date();
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);

    if (now < start) {
      return res.status(400).json({ message: 'This exam has not started yet' });
    }

    if (now > end) {
      return res.status(400).json({ message: 'This exam slot has closed' });
    }

    if (a.attempts.length >= a.maxAttempts) {
      return res.status(400).json({ message: 'You have exhausted the maximum number of attempts' });
    }

    // Prepare questions safely: hide correctOptionIndex
    const rawQuestions = a.questionPaper.questions;
    const safeQuestions = (Array.isArray(rawQuestions) ? rawQuestions : []).map(q => ({
      questionText: q.questionText,
      options: q.options
    }));

    res.json({
      id: a.id,
      title: a.title,
      endTime: a.endTime,
      maxAttempts: a.maxAttempts,
      questions: safeQuestions
    });
  } catch (err) {
    console.error('Take assignment error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/assignments/submit/:id
// Body: { answers: { [questionIndex]: number } }
const submitAssignment = async (req, res) => {
  try {
    const { id: studentId } = req.user;
    const { id } = req.params;
    const { answers } = req.body; // Map format: { "0": 1, "1": 3, ... }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'answers map is required' });
    }

    // Verify relationship
    const relation = await prisma.assignmentStudent.findUnique({
      where: { assignmentId_studentId: { assignmentId: id, studentId } },
      include: {
        assignment: {
          include: {
            questionPaper: true,
            attempts: { where: { studentId } }
          }
        }
      }
    });

    if (!relation) {
      return res.status(403).json({ message: 'You are not assigned to this assignment' });
    }

    const a = relation.assignment;
    const now = new Date();
    const start = new Date(a.startTime);
    const end = new Date(a.endTime);

    if (now < start || now > end) {
      return res.status(400).json({ message: 'This exam slot is currently closed' });
    }

    if (a.attempts.length >= a.maxAttempts) {
      return res.status(400).json({ message: 'No remaining attempts left' });
    }

    // Grade the MCQ answers
    const questions = a.questionPaper.questions;
    let score = 0;
    const maxScore = Array.isArray(questions) ? questions.length : 0;

    if (Array.isArray(questions)) {
      questions.forEach((q, idx) => {
        const studentSelect = answers[idx.toString()];
        if (studentSelect !== undefined && studentSelect === q.correctOptionIndex) {
          score++;
        }
      });
    }

    const attempt = await prisma.assignmentAttempt.create({
      data: {
        assignmentId: id,
        studentId,
        score,
        maxScore,
        answers
      }
    });

    // Determine what to return
    const showResults = a.resultDisplay === 'immediate' || a.resultsPublished;
    if (showResults) {
      return res.status(201).json({
        message: 'Exam completed successfully!',
        score,
        maxScore
      });
    }

    res.status(201).json({
      message: 'Exam submitted successfully! Results will be published by your instructor.',
      score: null,
      maxScore: null
    });
  } catch (err) {
    console.error('Submit assignment error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ── NOTIFICATION ENDPOINTS ──────────────────────────────────────

// GET /api/assignments/notifications
const getNotifications = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(list);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/assignments/notifications/read-all
const markAllNotificationsRead = async (req, res) => {
  try {
    const { id: userId } = req.user;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getPapers,
  createPaper,
  deletePaper,
  getActiveAssignments,
  scheduleAssignment,
  sendReminder,
  publishResults,
  getAssignmentReport,
  resetAttempt,
  getMyAssignments,
  takeAssignment,
  submitAssignment,
  getNotifications,
  markAllNotificationsRead
};
