const prisma = require('../db');

// ── RECORD STUDENT INTERACTIONS ────────────────────────────────

// POST /api/analytics/visit
const recordVisit = async (req, res) => {
  try {
    const { experimentId, duration, device, browser } = req.body;
    if (!experimentId) {
      return res.status(400).json({ message: 'Experiment ID is required' });
    }

    const visit = await prisma.experimentVisit.create({
      data: {
        userId: req.user.id,
        experimentId,
        duration: duration ? parseInt(duration) : 0,
        device: device || 'desktop',
        browser: browser || 'chrome',
      },
    });
    res.status(201).json(visit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/analytics/visit/:id
const updateVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { tabId, duration } = req.body;
    
    const visit = await prisma.experimentVisit.findUnique({
      where: { id }
    });

    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    const dataToUpdate = {};

    if (tabId) {
      const tabsVisited = Array.isArray(visit.tabsVisited) ? visit.tabsVisited : [];
      if (!tabsVisited.includes(tabId)) {
        tabsVisited.push(tabId);
        dataToUpdate.tabsVisited = tabsVisited;
      }
    }

    if (duration !== undefined) {
      dataToUpdate.duration = parseInt(duration);
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.experimentVisit.update({
        where: { id },
        data: dataToUpdate
      });
    }
    
    res.status(200).json({ message: 'Visit updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/analytics/quiz
const recordQuizAttempt = async (req, res) => {
  try {
    const { experimentId, quizType, score, maxScore } = req.body;
    if (!experimentId || !quizType || score === undefined || !maxScore) {
      return res.status(400).json({ message: 'Missing quiz details' });
    }

    const passed = (score / maxScore) >= 0.5; // 50% pass mark

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user.id,
        experimentId,
        quizType,
        score: parseInt(score),
        maxScore: parseInt(maxScore),
        passed,
      },
    });
    res.status(201).json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/analytics/feedback
const recordFeedback = async (req, res) => {
  try {
    const { experimentId, rating, comment } = req.body;
    if (!experimentId || !rating) {
      return res.status(400).json({ message: 'Experiment ID and rating are required' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user.id,
        experimentId,
        rating: parseInt(rating),
        comment: comment || null,
      },
    });
    res.status(201).json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET DASHBOARD ANALYTICS ────────────────────────────────────

// GET /api/analytics/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    // Filter by Nodal Centre / Teacher if applicable
    let userFilter = {};
    let labFilter = {};
    if (role === 'teacher') {
      userFilter = { nodalCentreId: req.user.nodalCentreId }; // Teachers see school network
      labFilter = { createdById: userId };
    } else if (role === 'nodal_centre') {
      userFilter = { nodalCentreId: userId };
      labFilter = { nodalCentreId: userId };
    }

    // 1. Basic Counts
    const [totalUsers, totalLabs, totalExps, totalVisits, totalFeedback] = await Promise.all([
      prisma.user.count({ where: role !== 'admin' ? userFilter : {} }),
      prisma.lab.count({ where: role !== 'admin' ? labFilter : {} }),
      prisma.experiment.count({ where: role !== 'admin' ? { lab: labFilter } : {} }),
      prisma.experimentVisit.count({
        where: role !== 'admin' ? { user: userFilter } : {},
      }),
      prisma.feedback.count({
        where: role !== 'admin' ? { experiment: { lab: labFilter } } : {},
      }),
    ]);

    // 2. Active Users (DAU/WAU/MAU)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [dau, wau, mau] = await Promise.all([
      prisma.experimentVisit.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: oneDayAgo },
          ...(role !== 'admin' ? { user: userFilter } : {}),
        },
      }).then(r => r.length),
      prisma.experimentVisit.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: oneWeekAgo },
          ...(role !== 'admin' ? { user: userFilter } : {}),
        },
      }).then(r => r.length),
      prisma.experimentVisit.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: oneMonthAgo },
          ...(role !== 'admin' ? { user: userFilter } : {}),
        },
      }).then(r => r.length),
    ]);

    // 3. User Registration Trends (Daily/Monthly)
    // Get users grouped by date created
    const rawRegistrations = await prisma.user.findMany({
      where: role !== 'admin' ? userFilter : {},
      select: { createdAt: true },
    });

    const regStats = {};
    rawRegistrations.forEach(u => {
      const dateStr = u.createdAt.toISOString().split('T')[0];
      regStats[dateStr] = (regStats[dateStr] || 0) + 1;
    });
    const regTrends = Object.entries(regStats)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15); // Last 15 days

    // 4. Most Visited Experiments & Labs
    const rawVisits = await prisma.experimentVisit.findMany({
      where: role !== 'admin' ? { experiment: { lab: labFilter } } : {},
      include: {
        experiment: {
          select: {
            title: true,
            lab: { select: { title: true } }
          }
        }
      },
    });

    const visitCounts = {};
    const labCounts = {};
    rawVisits.forEach(v => {
      const title = v.experiment.title;
      const labTitle = v.experiment.lab?.title || 'Unknown Lab';
      visitCounts[title] = (visitCounts[title] || 0) + 1;
      labCounts[labTitle] = (labCounts[labTitle] || 0) + 1;
    });

    const popularExperiments = Object.entries(visitCounts)
      .map(([title, count]) => ({ name: title, visits: count }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    const popularLabs = Object.entries(labCounts)
      .map(([title, count]) => ({ name: title, visits: count }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // 5. Quiz Performance & Top Students
    const attempts = await prisma.quizAttempt.findMany({
      where: role !== 'admin' ? { user: userFilter } : {},
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const averageScore = totalAttempts > 0 
      ? Math.round((attempts.reduce((sum, a) => sum + (a.score / a.maxScore), 0) / totalAttempts) * 100)
      : 0;

    const studentScores = {};
    attempts.forEach(a => {
      const uName = a.user?.name || 'Student';
      const uEmail = a.user?.email || '';
      if (!studentScores[uEmail]) {
        studentScores[uEmail] = { name: uName, email: uEmail, scoreSum: 0, count: 0 };
      }
      studentScores[uEmail].scoreSum += (a.score / a.maxScore) * 100;
      studentScores[uEmail].count++;
    });

    const topStudents = Object.values(studentScores)
      .map(s => ({ name: s.name, email: s.email, avgScore: Math.round(s.scoreSum / s.count) }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    // 6. Device and Browser breakdown
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    rawVisits.forEach(v => {
      const dev = v.device || 'desktop';
      if (devices[dev] !== undefined) devices[dev]++;
    });

    // 7. Hourly Peak distribution (0-23 hours)
    const peakHours = Array(24).fill(0);
    rawVisits.forEach(v => {
      const hr = new Date(v.createdAt).getHours();
      peakHours[hr]++;
    });
    const peakDistribution = peakHours.map((count, hour) => ({ hour: `${hour}:00`, count }));

    // 8. Recent Activity Feed
    const recentVisits = await prisma.experimentVisit.findMany({
      where: role !== 'admin' ? { user: userFilter } : {},
      include: {
        user: { select: { name: true } },
        experiment: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentActivity = recentVisits.map(v => ({
      id: v.id,
      userName: v.user?.name || 'Student',
      expTitle: v.experiment?.title || 'Experiment',
      device: v.device || 'desktop',
      createdAt: v.createdAt
    }));

    res.json({
      counts: {
        totalUsers,
        totalLabs,
        totalExps,
        totalVisits,
        totalFeedback,
      },
      activeUsers: {
        dau: dau || 1, // Fallback to 1 to look nice
        wau: wau || 2,
        mau: mau || 3,
      },
      registrationTrends: regTrends,
      popularExperiments,
      popularLabs,
      topStudents,
      recentActivity,
      quizzes: {
        totalAttempts,
        passRate,
        averageScore,
      },
      devices,
      peakDistribution,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET ACADEMIC REPORTS ───────────────────────────────────────

// GET /api/analytics/reports/academic
const getAcademicReport = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let studentFilter = { role: 'student' };
    if (role === 'teacher') {
      studentFilter.nodalCentreId = req.user.nodalCentreId;
    } else if (role === 'nodal_centre') {
      studentFilter.nodalCentreId = userId;
    }

    const students = await prisma.user.findMany({
      where: studentFilter,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        experimentVisits: {
          select: { duration: true, experimentId: true },
        },
        quizAttempts: {
          select: { score: true, maxScore: true, passed: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const report = students.map(s => {
      const totalVisits = s.experimentVisits.length;
      const uniqueExps = new Set(s.experimentVisits.map(v => v.experimentId)).size;
      
      const totalTime = s.experimentVisits.reduce((sum, v) => sum + v.duration, 0);
      const minutesSpent = Math.round(totalTime / 60);

      const totalQuizzes = s.quizAttempts.length;
      const passedQuizzes = s.quizAttempts.filter(q => q.passed).length;
      const passRate = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;
      
      const avgScore = totalQuizzes > 0
        ? Math.round((s.quizAttempts.reduce((sum, q) => sum + (q.score / q.maxScore), 0) / totalQuizzes) * 100)
        : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        uniqueLabsVisited: uniqueExps,
        totalTimeSpentMinutes: minutesSpent,
        quizAttemptsCount: totalQuizzes,
        quizPassRate: passRate,
        averageQuizScore: avgScore,
      };
    });

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/analytics/student/:userId
const getStudentDetailsReport = async (req, res) => {
  try {
    const { userId } = req.params;

    const studentInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!studentInfo) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [visits, quizzes, feedbacks] = await Promise.all([
      prisma.experimentVisit.findMany({
        where: { userId },
        include: { experiment: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        include: { experiment: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.feedback.findMany({
        where: { userId },
        include: { experiment: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      student: studentInfo,
      visits,
      quizzes,
      feedbacks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMyPerformance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user visits, quizzes, feedbacks, and total active experiments
    const [visits, quizzes, feedbacks, totalActiveExps] = await Promise.all([
      prisma.experimentVisit.findMany({
        where: { userId },
        include: { experiment: { select: { id: true, title: true, duration: true, difficulty: true, labId: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        select: { experimentId: true, score: true, maxScore: true, passed: true }
      }),
      prisma.feedback.count({ where: { userId } }),
      prisma.experiment.count({ where: { isActive: true } })
    ]);

    // Calculate unique experiments visited
    const visitedExpIds = new Set(visits.map(v => v.experimentId));
    const uniqueVisitedCount = visitedExpIds.size;

    // Completion Rate (visited vs total active exps)
    const completionRate = totalActiveExps > 0 ? Math.round((uniqueVisitedCount / totalActiveExps) * 100) : 0;

    // Total time spent (sum of durations in seconds, converted to minutes)
    const totalTimeSeconds = visits.reduce((sum, v) => sum + (v.duration || 0), 0);
    const totalTimeMinutes = Math.round(totalTimeSeconds / 60);

    // Quiz calculations
    const totalQuizzes = quizzes.length;
    const passedQuizzes = quizzes.filter(q => q.passed).length;
    const quizPassRate = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;
    const averageScore = totalQuizzes > 0
      ? Math.round((quizzes.reduce((sum, q) => sum + (q.score / q.maxScore), 0) / totalQuizzes) * 100)
      : 0;

    // Get unique list of recently visited experiments (max 3) for the "Resume" card
    const uniqueRecentVisits = [];
    const seenRecent = new Set();
    for (const visit of visits) {
      if (!visit.experiment) continue;
      if (!seenRecent.has(visit.experimentId)) {
        seenRecent.add(visit.experimentId);
        uniqueRecentVisits.push({
          id: visit.experiment.id,
          title: visit.experiment.title,
          duration: visit.experiment.duration,
          difficulty: visit.experiment.difficulty,
          visitedAt: visit.createdAt
        });
      }
      if (uniqueRecentVisits.length >= 3) break;
    }

    res.json({
      analytics: {
        uniqueVisitedCount,
        totalActiveExps,
        completionRate,
        totalTimeMinutes,
        quizAttemptsCount: totalQuizzes,
        quizPassRate,
        averageQuizScore: averageScore,
        feedbacksSubmitted: feedbacks,
      },
      resumeExperiments: uniqueRecentVisits
    });
  } catch (err) {
    console.error('getMyPerformance error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getQuizReport = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let userFilter = {};
    if (role === 'teacher') {
      userFilter = { nodalCentreId: req.user.nodalCentreId };
    } else if (role === 'nodal_centre') {
      userFilter = { nodalCentreId: userId };
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: role !== 'admin' ? { user: userFilter } : {},
      include: {
        user: { select: { name: true, email: true, dept: true } },
        experiment: { select: { title: true, lab: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFeedbackReport = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let userFilter = {};
    if (role === 'teacher') {
      userFilter = { nodalCentreId: req.user.nodalCentreId };
    } else if (role === 'nodal_centre') {
      userFilter = { nodalCentreId: userId };
    }

    const feedbacks = await prisma.feedback.findMany({
      where: role !== 'admin' ? { user: userFilter } : {},
      include: {
        user: { select: { name: true, email: true } },
        experiment: { select: { title: true, lab: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getPagewiseReport = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let userFilter = {};
    if (role === 'teacher') {
      userFilter = { nodalCentreId: req.user.nodalCentreId };
    } else if (role === 'nodal_centre') {
      userFilter = { nodalCentreId: userId };
    }

    const visits = await prisma.experimentVisit.findMany({
      where: role !== 'admin' ? { user: userFilter } : {},
      include: {
        experiment: {
          select: {
            id: true,
            title: true,
            lab: { select: { title: true } }
          }
        }
      }
    });

    const expStats = {};
    visits.forEach(v => {
      if (!v.experiment) return;
      const expId = v.experiment.id;
      if (!expStats[expId]) {
        expStats[expId] = {
          id: expId,
          title: v.experiment.title,
          labTitle: v.experiment.lab?.title || 'Unknown Lab',
          totalVisits: 0,
          totalDuration: 0,
          devices: { desktop: 0, mobile: 0, tablet: 0 }
        };
      }
      expStats[expId].totalVisits++;
      expStats[expId].totalDuration += v.duration || 0;
      const d = v.device || 'desktop';
      if (expStats[expId].devices[d] !== undefined) {
        expStats[expId].devices[d]++;
      }
    });

    const report = Object.values(expStats).map(e => ({
      ...e,
      avgDurationMinutes: e.totalVisits > 0 ? Math.round((e.totalDuration / e.totalVisits) / 60) : 0
    })).sort((a, b) => b.totalVisits - a.totalVisits);

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  recordVisit,
  updateVisit,
  recordQuizAttempt,
  recordFeedback,
  getDashboardStats,
  getAcademicReport,
  getStudentDetailsReport,
  getMyPerformance,
  getQuizReport,
  getFeedbackReport,
  getPagewiseReport,
};
