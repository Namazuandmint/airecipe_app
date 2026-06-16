import { useState, type FormEvent } from "react";
import {
  registerWithPassword,
  type AuthUser,
} from "../lib/authApi";
import { useI18n } from "../lib/useI18n";

type RegisterPageProps = {
  onAuthenticated?: (user: AuthUser) => void;
  onNavigateToLogin?: () => void;
};

export default function RegisterPage({
  onAuthenticated,
  onNavigateToLogin,
}: RegisterPageProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!email || !password) {
      setErrorMessage(t("login.emailPasswordRequired"));
      return;
    }

    setIsLoading(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const result = await registerWithPassword(email, password);
      setStatusMessage(
        result.needsEmailConfirmation
          ? t("login.confirmationSent")
          : t("login.registerSuccess"),
      );

      if (result.user && !result.needsEmailConfirmation) {
        onAuthenticated?.(result.user);
      }
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("login.registerFailed"),
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <div className="auth-brand">
          <div className="auth-logo">
            <img src="/app-icon.png" alt="" />
          </div>
          <strong>{t("app.name")}</strong>
        </div>

        <div className="auth-field">
          <label>{t("login.email")}</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <label>{t("login.password")}</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        {statusMessage ? (
          <p className="status-message auth-status-message" role="status">
            {statusMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="status-message error-message auth-status-message" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <p className="auth-note">{t("login.emailDelayNotice")}</p>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="primary-button auth-button"
        >
          {isLoading ? t("login.loading") : t("login.register")}
        </button>

        <div className="auth-divider">
          <span />
          <em>{t("login.or")}</em>
          <span />
        </div>

        <button
          type="button"
          onClick={onNavigateToLogin}
          className="secondary-button auth-button"
        >
          {t("login.submit")}
        </button>
      </form>
    </main>
  );
}
