import { useState } from "react";
import { COLORS } from "../../theme/colors";
import { FONT_BODY } from "../../theme/fonts";

const S = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.bg,
    fontFamily: FONT_BODY,
    padding: 20,
  },
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 32,
    width: "100%",
    maxWidth: 380,
  },
  title: {
    color: COLORS.gold,
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 16,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: FONT_BODY,
  },
  button: {
    width: "100%",
    padding: "10px 0",
    background: COLORS.gold,
    color: COLORS.bg,
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT_BODY,
  },
  toggle: {
    color: COLORS.gold,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
    fontFamily: FONT_BODY,
  },
  error: {
    color: COLORS.red,
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  footer: {
    marginTop: 16,
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 13,
  },
  resetLink: {
    color: COLORS.textMuted,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    padding: 0,
    textDecoration: "underline",
    fontFamily: FONT_BODY,
  },
  successMsg: {
    color: COLORS.green,
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
};

export function AuthScreen({ onLogin, onRegister, onResetPassword, error }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const displayError = localError || error;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);

    try {
      if (mode === "register") {
        if (password.length < 6) {
          setLocalError("Password must be at least 6 characters");
          return;
        }
        if (password !== confirmPassword) {
          setLocalError("Passwords do not match");
          return;
        }
        await onRegister(email, password);
      } else if (mode === "reset") {
        await onResetPassword(email);
        setResetSent(true);
      } else {
        await onLogin(email, password);
      }
    } catch {
      // error is set by parent via error prop
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setLocalError(null);
    setResetSent(false);
  };

  return (
    <div style={S.wrapper}>
      <div style={S.card}>
        <div style={S.title}>Invest</div>
        <div style={S.subtitle}>
          {mode === "login" && "Sign in to your account"}
          {mode === "register" && "Create a new account"}
          {mode === "reset" && "Reset your password"}
        </div>

        {displayError && <div style={S.error}>{displayError}</div>}
        {resetSent && <div style={S.successMsg}>Password reset email sent.</div>}

        <form onSubmit={handleSubmit}>
          <label style={S.label}>Email</label>
          <input
            style={S.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          {mode !== "reset" && (
            <>
              <label style={S.label}>Password</label>
              <input
                style={S.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </>
          )}

          {mode === "register" && (
            <>
              <label style={S.label}>Confirm Password</label>
              <input
                style={S.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </>
          )}

          <button style={S.button} type="submit" disabled={submitting}>
            {submitting
              ? "..."
              : mode === "login"
                ? "Sign In"
                : mode === "register"
                  ? "Create Account"
                  : "Send Reset Email"}
          </button>
        </form>

        {mode === "login" && (
          <div style={{ textAlign: "right", marginTop: 8 }}>
            <button style={S.resetLink} onClick={() => switchMode("reset")}>
              Forgot password?
            </button>
          </div>
        )}

        <div style={S.footer}>
          {mode === "login" ? (
            <>
              No account?{" "}
              <button style={S.toggle} onClick={() => switchMode("register")}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button style={S.toggle} onClick={() => switchMode("login")}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
