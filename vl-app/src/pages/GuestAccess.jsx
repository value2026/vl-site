import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuthRedirectPath } from '../utils/authRedirect';
import { COUNTRIES } from '../data/countries';
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  OTP_REGEX,
  AGE_GROUPS,
  GENDERS,
  PROFESSIONS,
  CONTROL_BASE,
  CONTROL_OK,
  CONTROL_ERR,
  buildDescribedBy,
} from '../data/guestOptions';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import SelectField from '../components/auth/GuestSelectField';

const INITIAL_FORM = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  ageGroup: '',
  gender: '',
  profession: '',
  subject: '',
  college: '',
  university: '',
  country: '',
  state: '',
};

const VALIDATION_ORDER = [
  'name',
  'email',
  'mobile',
  'password',
  'ageGroup',
  'gender',
  'profession',
  'country',
];

/**
 * Dedicated Guest Registration & pre-login email verification page (linked from /login).
 */
export default function GuestAccess() {
  const { guestRegister, verifyGuestEmail, resendGuestVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialVerifyEmail = (searchParams.get('verifyEmail') || searchParams.get('email') || '').trim();
  const initialVerifyToken = (searchParams.get('verifyToken') || '').trim();

  const [step, setStep] = useState(initialVerifyEmail ? 'verify' : 'register');
  const [pendingEmail, setPendingEmail] = useState(initialVerifyEmail);
  const [bannerError, setBannerError] = useState('');
  const [bannerInfo, setBannerInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const [regForm, setRegForm] = useState(INITIAL_FORM);
  const [regErrors, setRegErrors] = useState({});
  const [showRegPw, setShowRegPw] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(Boolean(initialVerifyToken && initialVerifyEmail));
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const regRefs = useRef({});
  const otpInputRef = useRef(null);
  const interactedRef = useRef(new Set());
  const autoVerifiedRef = useRef(false);
  const busy = submitting || verifying || resending || googleBusy;

  const completeAuthRedirect = (authUser) => {
    navigate(getAuthRedirectPath(authUser, location.state), { replace: true });
  };

  const redirectToLoginAfterVerify = (verifiedEmail, message) => {
    navigate('/login', {
      replace: true,
      state: {
        ...(location.state || {}),
        prefillEmail: verifiedEmail,
        verifiedMessage: message || 'Email verified successfully. Please sign in to continue.',
      },
    });
  };

  useEffect(() => {
    if (!initialVerifyToken || !initialVerifyEmail || autoVerifiedRef.current) return;
    autoVerifiedRef.current = true;
    setVerifying(true);
    verifyGuestEmail({ email: initialVerifyEmail, token: initialVerifyToken })
      .then((res) => {
        redirectToLoginAfterVerify(res.email || initialVerifyEmail, res.message);
      })
      .catch((err) => {
        setBannerError(err.message || 'Verification link is invalid or expired.');
      })
      .finally(() => {
        setVerifying(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVerifyToken, initialVerifyEmail]);

  useEffect(() => {
    if (step === 'verify' && !verifying) {
      otpInputRef.current?.focus();
    }
  }, [step, verifying]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((sec) => (sec <= 1 ? 0 : sec - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateRegField = (field, values, forceRequired = false) => {
    const val = (values[field] || '').trim();
    switch (field) {
      case 'name':
        return !val && forceRequired ? 'Please enter your full name.' : '';
      case 'email':
        if (!val) return forceRequired ? 'Please enter your email address.' : '';
        return EMAIL_REGEX.test(val) ? '' : 'Please enter a valid email address.';
      case 'password': {
        const rawPw = values.password || '';
        if (!rawPw) return forceRequired ? 'Please create a password.' : '';
        return rawPw.length >= 6 ? '' : 'Password must be at least 6 characters.';
      }
      case 'ageGroup':
        return !val && forceRequired ? 'Please select your age group.' : '';
      case 'gender':
        return !val && forceRequired ? 'Please select your gender.' : '';
      case 'mobile':
        if (!val) return '';
        return PHONE_REGEX.test(val) ? '' : 'Please enter a valid phone number.';
      case 'profession':
        return !val && forceRequired ? 'Please select your profession.' : '';
      case 'country':
        return !val && forceRequired ? 'Please select your country.' : '';
      default:
        return '';
    }
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    interactedRef.current.add(name);
    const nextValues = { ...regForm, [name]: value };
    setRegForm(nextValues);

    if (regErrors[name]) {
      const msg = validateRegField(name, nextValues, true);
      setRegErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleRegBlur = (e) => {
    const { name, value } = e.target;
    if (!interactedRef.current.has(name) && !value) return;
    const nextValues = { ...regForm, [name]: value };
    const msg = validateRegField(name, nextValues, interactedRef.current.has(name));
    setRegErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setBannerError('');
    setBannerInfo('');

    const nextErrors = {};
    for (const key of VALIDATION_ORDER) {
      const msg = validateRegField(key, regForm, true);
      if (msg) nextErrors[key] = msg;
    }

    if (Object.keys(nextErrors).length > 0) {
      setRegErrors(nextErrors);
      const firstKey = VALIDATION_ORDER.find((k) => nextErrors[k]);
      regRefs.current[firstKey]?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await guestRegister(regForm);
      setPendingEmail(res.email || regForm.email.trim().toLowerCase());
      setOtp('');
      setOtpError('');
      setBannerInfo(res.message || 'Verification code sent to your email. Please verify before signing in.');
      setResendCooldown(30);
      setStep('verify');
    } catch (err) {
      setBannerError(err.message || 'Unable to create guest account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setBannerError('');
    setBannerInfo('');
    const cleanOtp = otp.replace(/\s+/g, '');
    if (!OTP_REGEX.test(cleanOtp)) {
      setOtpError('Please enter the 6-digit verification code sent to your email.');
      otpInputRef.current?.focus();
      return;
    }

    setVerifying(true);
    try {
      const res = await verifyGuestEmail({ email: pendingEmail, otp: cleanOtp });
      redirectToLoginAfterVerify(res.email || pendingEmail, res.message);
    } catch (err) {
      setBannerError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingEmail || resendCooldown > 0 || busy) return;
    setBannerError('');
    setBannerInfo('');
    setResending(true);
    try {
      const res = await resendGuestVerification(pendingEmail);
      setBannerInfo(res.message || 'A new verification code has been sent to your email.');
      setResendCooldown(30);
      setOtp('');
      setOtpError('');
    } catch (err) {
      setBannerError(err.message || 'Unable to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center py-5 px-4 relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40rem] h-[40rem] bg-indigo-100/60 rounded-full blur-[140px]" />
        <div className="absolute bottom-[5%] right-[15%] w-[35rem] h-[35rem] bg-rose-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="mb-3 flex items-center justify-between">
          <Link
            to="/login"
            state={location.state}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Portal Login
          </Link>
        </div>

        <div className="bg-white rounded-[1.5rem] border border-slate-200/80 shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Side: Guest Registration or Email Verification */}
          <div className="lg:col-span-8 p-6 sm:p-7">

            {step === 'verify' ? (
              <>
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-primary-50 text-primary-800 mb-3">
                  <MailCheck className="w-6 h-6" aria-hidden="true" />
                </div>
                <h1 id="guest-verify-heading" className="text-2xl font-bold text-slate-900 mb-1.5">
                  Verify Your Email
                </h1>
                <p className="text-sm text-slate-600 mb-6">
                  Before signing in, enter the 6-digit verification code sent to{' '}
                  <strong className="text-slate-900">{pendingEmail}</strong> (or click the link in that email).
                </p>

                {bannerError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium"
                  >
                    {bannerError}
                  </div>
                )}

                {bannerInfo && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 font-medium"
                  >
                    {bannerInfo}
                  </div>
                )}

                <form
                  onSubmit={handleVerifySubmit}
                  noValidate
                  aria-labelledby="guest-verify-heading"
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label htmlFor="guest-verify-otp" className="block text-[14px] font-semibold text-slate-700 mb-1.5">
                      Verification Code <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={otpInputRef}
                      id="guest-verify-otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      enterKeyHint="done"
                      maxLength={6}
                      pattern="\d{6}"
                      required
                      aria-invalid={otpError ? 'true' : 'false'}
                      aria-describedby={buildDescribedBy(
                        'guest-verify-otp-help',
                        'guest-verify-otp-error',
                        Boolean(otpError)
                      )}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        if (otpError) setOtpError('');
                      }}
                      placeholder="Enter 6-digit code"
                      className={`${CONTROL_BASE} tracking-[0.35em] font-semibold ${otpError ? CONTROL_ERR : CONTROL_OK}`}
                    />
                    <p id="guest-verify-otp-help" className="mt-1 text-xs text-slate-500">
                      Check your Gmail / inbox (and spam folder). Code expires in 15 minutes.
                    </p>
                    {otpError && (
                      <p id="guest-verify-otp-error" className="mt-1 text-xs font-medium text-red-600">
                        {otpError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full min-h-[48px] bg-primary-800 hover:bg-primary-900 text-white font-bold rounded-xl py-3 text-[15px] flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-900/10 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {verifying ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying Email…
                      </span>
                    ) : (
                      <>
                        Verify Email & Continue to Login
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || busy}
                      className="font-semibold text-primary-700 hover:text-primary-900 hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
                    >
                      {resending
                        ? 'Sending…'
                        : resendCooldown > 0
                          ? `Resend code (${resendCooldown}s)`
                          : 'Resend verification code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('register');
                        setBannerError('');
                        setBannerInfo('');
                        setOtp('');
                        setOtpError('');
                      }}
                      className="text-slate-600 hover:text-slate-900 font-medium hover:underline cursor-pointer"
                    >
                      Edit registration details
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h1 id="guest-register-heading" className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                  Register as a Guest
                </h1>
                <p className="text-sm text-slate-500 mb-4">
                  Create your guest account and verify your email before signing in.
                </p>

                {bannerError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-medium"
                  >
                    {bannerError}
                  </div>
                )}

                {bannerInfo && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-blue-800 font-medium"
                  >
                    {bannerInfo}
                  </div>
                )}

                <form
                  onSubmit={handleRegisterSubmit}
                  noValidate
                  aria-labelledby="guest-register-heading"
                  className="space-y-3"
                >
                  {/* Row 1: Full Name & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="guest-reg-name" className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        ref={(el) => { regRefs.current.name = el; }}
                        id="guest-reg-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        enterKeyHint="next"
                        maxLength={80}
                        required
                        aria-invalid={regErrors.name ? 'true' : 'false'}
                        aria-describedby={buildDescribedBy(null, 'guest-reg-name-error', Boolean(regErrors.name))}
                        value={regForm.name}
                        onChange={handleRegChange}
                        onBlur={handleRegBlur}
                        placeholder="Enter your full name"
                        className={`${CONTROL_BASE} ${regErrors.name ? CONTROL_ERR : CONTROL_OK}`}
                      />
                      {regErrors.name && (
                        <p id="guest-reg-name-error" className="mt-1 text-xs font-medium text-red-600">
                          {regErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="guest-reg-email" className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <input
                        ref={(el) => { regRefs.current.email = el; }}
                        id="guest-reg-email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        spellCheck={false}
                        autoCapitalize="none"
                        autoCorrect="off"
                        enterKeyHint="next"
                        maxLength={160}
                        required
                        aria-invalid={regErrors.email ? 'true' : 'false'}
                        aria-describedby={buildDescribedBy(null, 'guest-reg-email-error', Boolean(regErrors.email))}
                        value={regForm.email}
                        onChange={handleRegChange}
                        onBlur={handleRegBlur}
                        placeholder="you@gmail.com"
                        className={`${CONTROL_BASE} ${regErrors.email ? CONTROL_ERR : CONTROL_OK}`}
                      />
                      {regErrors.email && (
                        <p id="guest-reg-email-error" className="mt-1 text-xs font-medium text-red-600">
                          {regErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone Number & Password (aligned directly beneath Email Address) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="guest-reg-mobile" className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        ref={(el) => { regRefs.current.mobile = el; }}
                        id="guest-reg-mobile"
                        name="mobile"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        enterKeyHint="next"
                        maxLength={24}
                        aria-invalid={regErrors.mobile ? 'true' : 'false'}
                        aria-describedby={buildDescribedBy(null, 'guest-reg-mobile-error', Boolean(regErrors.mobile))}
                        value={regForm.mobile}
                        onChange={handleRegChange}
                        onBlur={handleRegBlur}
                        placeholder="+91 00000 00000"
                        className={`${CONTROL_BASE} ${regErrors.mobile ? CONTROL_ERR : CONTROL_OK}`}
                      />
                      {regErrors.mobile && (
                        <p id="guest-reg-mobile-error" className="mt-1 text-xs font-medium text-red-600">
                          {regErrors.mobile}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="guest-reg-password" className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        Password <span className="text-red-500" aria-hidden="true">*</span>{' '}
                        <span className="text-xs font-normal text-slate-500">(min 6 chars)</span>
                      </label>
                      <div className="relative">
                        <input
                          ref={(el) => { regRefs.current.password = el; }}
                          id="guest-reg-password"
                          name="password"
                          type={showRegPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          enterKeyHint="next"
                          minLength={6}
                          maxLength={128}
                          required
                          aria-invalid={regErrors.password ? 'true' : 'false'}
                          aria-describedby={buildDescribedBy(null, 'guest-reg-password-error', Boolean(regErrors.password))}
                          value={regForm.password}
                          onChange={handleRegChange}
                          onBlur={handleRegBlur}
                          placeholder="Create a password"
                          className={`${CONTROL_BASE} pr-11 ${regErrors.password ? CONTROL_ERR : CONTROL_OK}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPw((v) => !v)}
                          aria-pressed={showRegPw}
                          aria-label={showRegPw ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {regErrors.password && (
                        <p id="guest-reg-password-error" className="mt-1 text-xs font-medium text-red-600">
                          {regErrors.password}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Age Group & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectField
                      id="guest-reg-age-group"
                      name="ageGroup"
                      label="Age Group"
                      required
                      value={regForm.ageGroup}
                      error={regErrors.ageGroup}
                      options={AGE_GROUPS}
                      selectRef={(el) => { regRefs.current.ageGroup = el; }}
                      onChange={handleRegChange}
                      onBlur={handleRegBlur}
                    />

                    <fieldset
                      aria-describedby={buildDescribedBy(null, 'guest-reg-gender-error', Boolean(regErrors.gender))}
                      className="min-w-0"
                    >
                      <legend className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        Gender <span className="text-red-500" aria-hidden="true">*</span>
                      </legend>
                      <div
                        className={`min-h-[44px] px-3.5 rounded-xl border bg-slate-50/80 flex items-center gap-6 ${regErrors.gender ? 'border-red-500 bg-red-50/40' : 'border-slate-300'}`}
                      >
                        {GENDERS.map((option, idx) => {
                          const radioId = `guest-reg-gender-${option.toLowerCase()}`;
                          return (
                            <div key={option} className="flex items-center gap-2 py-1.5">
                              <input
                                ref={idx === 0 ? (el) => { regRefs.current.gender = el; } : undefined}
                                id={radioId}
                                name="gender"
                                type="radio"
                                value={option}
                                required
                                checked={regForm.gender === option}
                                aria-invalid={regErrors.gender ? 'true' : 'false'}
                                onChange={handleRegChange}
                                className="w-4 h-4 accent-primary-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
                              />
                              <label htmlFor={radioId} className="text-[14.5px] text-slate-800 font-medium cursor-pointer select-none">
                                {option}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      {regErrors.gender && (
                        <p id="guest-reg-gender-error" className="mt-1 text-xs font-medium text-red-600">
                          {regErrors.gender}
                        </p>
                      )}
                    </fieldset>
                  </div>

                  {/* Row 4: Profession & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectField
                      id="guest-reg-profession"
                      name="profession"
                      label="Profession"
                      required
                      value={regForm.profession}
                      error={regErrors.profession}
                      options={PROFESSIONS}
                      selectRef={(el) => { regRefs.current.profession = el; }}
                      onChange={handleRegChange}
                      onBlur={handleRegBlur}
                    />

                    <div>
                      <label htmlFor="guest-reg-subject" className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        Subject
                      </label>
                      <input
                        id="guest-reg-subject"
                        name="subject"
                        type="text"
                        enterKeyHint="next"
                        maxLength={100}
                        aria-invalid="false"
                        value={regForm.subject}
                        onChange={handleRegChange}
                        placeholder="e.g. Computer Science, Physics"
                        className={`${CONTROL_BASE} ${CONTROL_OK}`}
                      />
                    </div>
                  </div>

                  {/* Row 5: College & University */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="guest-reg-college" className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        College
                      </label>
                      <input
                        id="guest-reg-college"
                        name="college"
                        type="text"
                        autoComplete="organization"
                        enterKeyHint="next"
                        maxLength={120}
                        aria-invalid="false"
                        value={regForm.college}
                        onChange={handleRegChange}
                        placeholder="Enter your college name"
                        className={`${CONTROL_BASE} ${CONTROL_OK}`}
                      />
                    </div>

                    <div>
                      <label htmlFor="guest-reg-university" className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        University
                      </label>
                      <input
                        id="guest-reg-university"
                        name="university"
                        type="text"
                        enterKeyHint="next"
                        maxLength={120}
                        aria-invalid="false"
                        value={regForm.university}
                        onChange={handleRegChange}
                        placeholder="Enter your university name"
                        className={`${CONTROL_BASE} ${CONTROL_OK}`}
                      />
                    </div>
                  </div>

                  {/* Row 6: Country & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectField
                      id="guest-reg-country"
                      name="country"
                      label="Country"
                      required
                      autoComplete="country-name"
                      value={regForm.country}
                      error={regErrors.country}
                      options={COUNTRIES}
                      selectRef={(el) => { regRefs.current.country = el; }}
                      onChange={handleRegChange}
                      onBlur={handleRegBlur}
                    />

                    <div>
                      <label htmlFor="guest-reg-state" className="block text-[13.5px] font-semibold text-slate-700 mb-1">
                        State
                      </label>
                      <input
                        id="guest-reg-state"
                        name="state"
                        type="text"
                        autoComplete="address-level1"
                        enterKeyHint="done"
                        maxLength={80}
                        aria-invalid="false"
                        value={regForm.state}
                        onChange={handleRegChange}
                        placeholder="Enter your state or region"
                        className={`${CONTROL_BASE} ${CONTROL_OK}`}
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full min-h-[46px] bg-primary-800 hover:bg-primary-900 text-white font-bold rounded-xl py-2.5 text-[15px] flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-900/10 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending Verification Code…
                        </span>
                      ) : (
                        <>
                          Register & Verify Email
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      state={location.state}
                      className="font-semibold text-primary-700 hover:text-primary-900 hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>

          {/* Right Side: Continue with Google */}
          <aside className="lg:col-span-4 bg-slate-50/90 border-t lg:border-t-0 lg:border-l border-slate-200/80 p-6 sm:p-8 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto text-center">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Continue with Google</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Quickly create a guest account or sign in using your verified Google account.
              </p>

              <SocialAuthButtons
                onSuccess={completeAuthRedirect}
                onError={(msg) => setBannerError(msg)}
                onInfo={(msg) => setBannerInfo(msg)}
                onBusyChange={setGoogleBusy}
                disabled={submitting}
                googleUnavailableMessage="Google Sign-In is currently unavailable. Please complete the guest registration form on the left."
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
