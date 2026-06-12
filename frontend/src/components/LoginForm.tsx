import ErrorMessage from "./Error"
import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type CSSProperties,
    type FormEvent,
} from "react"

type FontLike = any

type LoginFormProps = {
    title?: string
    helperText?: string

    // Login
    emailLabel?: string
    passwordLabel?: string
    emailPlaceholder?: string
    passwordPlaceholder?: string
    buttonLabel?: string

    // Register
    enableRegister?: boolean
    registerLinkLabel?: string
    backToLoginLabel?: string
    registerTitle?: string
    registerHelperText?: string
    nameLabel?: string
    namePlaceholder?: string
    confirmPasswordLabel?: string
    confirmPasswordPlaceholder?: string
    registerButtonLabel?: string

    initialError?: string
    backgroundColor?: string
    cardColor?: string
    borderColor?: string
    textColor?: string
    placeholderColor?: string
    errorColor?: string
    buttonColor?: string
    buttonTextColor?: string
    radius?: number
    gap?: number
    padding?: string
    titleFont?: FontLike
    labelFont?: FontLike
    inputFont?: FontLike
    helperFont?: FontLike
    errorFont?: FontLike
    buttonFont?: FontLike
    onSubmit?: (payload: {
        email: string
        password: string
        name: string
        confirmPassword: string
        mode: "login" | "register"
    }) => void
    onSuccess?: (payload: {
        email: string
        password: string
        name: string
        confirmPassword: string
        mode: "login" | "register"
    }) => void
    onError?: (message: string) => void
    externalError?: string
    style?: CSSProperties
}

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * LoginForm
 *
 * @framerIntrinsicWidth 420
 * @framerIntrinsicHeight 320
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function LoginForm(props: LoginFormProps) {
    const {
        title = "Iniciar sesión",
        emailLabel = "Email",
        passwordLabel = "Contraseña",
        emailPlaceholder = "tu@empresa.com",
        passwordPlaceholder = "••••••••",
        buttonLabel = "Entrar",
        helperText = "Accede para gestionar órdenes de mantenimiento.",
        // Register
        enableRegister = false,
        registerLinkLabel = "Registrarse",
        backToLoginLabel = "Volver al login",
        registerTitle = "Crear cuenta",
        registerHelperText = "Completa los datos para registrarte.",
        nameLabel = "Nombre",
        namePlaceholder = "Nombre",
        confirmPasswordLabel = "Repetir contraseña",
        confirmPasswordPlaceholder = "••••••••",
        registerButtonLabel = "Registrar",
        initialError,
        externalError,
        backgroundColor = "#F8FAFC",
        cardColor = "#FFFFFF",
        borderColor = "#E5E7EB",
        textColor = "#111827",
        placeholderColor = "#6B7280",
        errorColor = "#DC2626",
        buttonColor = "#2563EB",
        buttonTextColor = "#FFFFFF",
        radius = 8,
        gap = 16,
        padding = "20px",
        titleFont,
        labelFont,
        inputFont,
        helperFont,
        errorFont,
        buttonFont,
        onSubmit,
        onSuccess,
        onError,
        backendError,
        style,
    } = props

    const [mode, setMode] = useState<"login" | "register">("login")

    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState(initialError || "")
    const [touched, setTouched] = useState(false)

    useEffect(() => {
        if (externalError) {
            setError(externalError)
            setTouched(true)
        }
    }, [externalError])

    const isFixedWidth = !!(style && style.width === "100%")

    const canSubmit = useMemo(() => {
        if (mode === "register") {
            return (
                email.trim().length > 0 &&
                name.trim().length > 0 &&
                password.length > 0 &&
                confirmPassword.length > 0
            )
        }
        return email.trim().length > 0 && password.length > 0
    }, [email, name, password, confirmPassword, mode])

    const validate = useCallback(() => {
        if (!email.trim()) return "El email es obligatorio."
        if (!isValidEmail(email)) return "El email no es válido."

        if (mode === "register") {
            if (!name.trim()) return "El nombre es obligatorio."
            if (!password) return "La contraseña es obligatoria."
            if (password.length < 6)
                return "La contraseña debe tener al menos 6 caracteres."
            if (!confirmPassword) return "Repite la contraseña."
            if (password !== confirmPassword)
                return "Las contraseñas no coinciden."
            return ""
        }

        if (!password) return "La contraseña es obligatoria."
        if (password.length < 6)
            return "La contraseña debe tener al menos 6 caracteres."
        return ""
    }, [email, password, confirmPassword, name, mode])

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault()

            const payload = {
                email,
                password,
                name,
                confirmPassword,
                mode,
            }

            if (onSubmit) onSubmit(payload)

            startTransition(() => setTouched(true))
            const msg = validate()
            if (msg) {
                startTransition(() => setError(msg))
                if (onError) onError(msg)
                return
            }

            startTransition(() => setError(""))
            if (onSuccess) onSuccess(payload)
        },
        [onSubmit, onSuccess, onError, validate, email, password, name, confirmPassword, mode]
    )

    const showError = (touched || !!initialError) && !!error

    return (
        <div
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                background: backgroundColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                color: textColor,
                overflow: "hidden",
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    width: isFixedWidth ? "100%" : "min(800px, 100%)",
                    maxWidth: "100%",
                    background: cardColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: radius,
                    padding,
                    display: "flex",
                    flexDirection: "column",
                    gap,
                    boxSizing: "border-box",
                }}
                aria-label={
                    mode === "login"
                        ? "Formulario de inicio de sesión"
                        : "Formulario de registro"
                }
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: Math.max(8, gap * 0.6),
                    }}
                >
                    <div style={{ ...titleFont, color: textColor }}>
                        {mode === "login" ? title : registerTitle}
                    </div>
                    {(mode === "login" ? helperText : registerHelperText) ? (
                        <div
                            style={{
                                ...helperFont,
                                color: textColor,
                                opacity: 0.7,
                            }}
                        >
                            {mode === "login" ? helperText : registerHelperText}
                        </div>
                    ) : null}
                </div>

                <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                    <label style={{ ...labelFont, color: textColor }}>
                        {emailLabel}
                    </label>
                    <input
                        aria-label={emailLabel}
                        value={email}
                        onChange={(e) =>
                            startTransition(() => setEmail(e.target.value))
                        }
                        onBlur={() => startTransition(() => setTouched(true))}
                        type="email"
                        placeholder={emailPlaceholder}
                        autoComplete="email"
                        style={{
                            ...inputFont,
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "12px 12px",
                            borderRadius: Math.max(8, radius * 0.6),
                            border: `1px solid ${borderColor}`,
                            background: "transparent",
                            color: textColor,
                            outline: "none",
                        }}
                    />
                    <div
                        aria-hidden
                        style={{
                            height: 0,
                            overflow: "hidden",
                            color: placeholderColor,
                        }}
                    />
                </div>

                {mode === "register" ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                        }}
                    >
                        <label style={{ ...labelFont, color: textColor }}>
                            {nameLabel}
                        </label>
                        <input
                            aria-label={nameLabel}
                            value={name}
                            onChange={(e) =>
                                startTransition(() => setName(e.target.value))
                            }
                            onBlur={() =>
                                startTransition(() => setTouched(true))
                            }
                            type="text"
                            placeholder={namePlaceholder}
                            autoComplete="name"
                            style={{
                                ...inputFont,
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "12px 12px",
                                borderRadius: Math.max(8, radius * 0.6),
                                border: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                    </div>
                ) : null}

                <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                    <label style={{ ...labelFont, color: textColor }}>
                        {passwordLabel}
                    </label>
                    <div style={{ position: "relative", width: "100%" }}>
                        <input
                            aria-label={passwordLabel}
                            value={password}
                            onChange={(e) =>
                                startTransition(() =>
                                    setPassword(e.target.value)
                                )
                            }
                            onBlur={() =>
                                startTransition(() => setTouched(true))
                            }
                            type={showPassword ? "text" : "password"}
                            placeholder={passwordPlaceholder}
                            autoComplete={
                                mode === "login"
                                    ? "current-password"
                                    : "new-password"
                            }
                            style={{
                                ...inputFont,
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "12px 44px 12px 12px",
                                borderRadius: Math.max(8, radius * 0.6),
                                border: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                startTransition(() =>
                                    setShowPassword((v) => !v)
                                )
                            }
                            aria-label={
                                showPassword
                                    ? "Ocultar contraseña"
                                    : "Mostrar contraseña"
                            }
                            style={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 32,
                                height: 32,
                                border: "none",
                                background: "transparent",
                                padding: 0,
                                margin: 0,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: textColor,
                                opacity: 0.8,
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                focusable="false"
                                style={{ display: "block" }}
                            >
                                <path
                                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                {showPassword ? (
                                    <path
                                        d="M4 4l16 16"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                ) : null}
                            </svg>
                        </button>
                    </div>
                </div>

                {mode === "register" ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                        }}
                    >
                        <label style={{ ...labelFont, color: textColor }}>
                            {confirmPasswordLabel}
                        </label>
                        <div style={{ position: "relative", width: "100%" }}>
                            <input
                                aria-label={confirmPasswordLabel}
                                value={confirmPassword}
                                onChange={(e) =>
                                    startTransition(() =>
                                        setConfirmPassword(e.target.value)
                                    )
                                }
                                onBlur={() =>
                                    startTransition(() => setTouched(true))
                                }
                                type={showPassword ? "text" : "password"}
                                placeholder={confirmPasswordPlaceholder}
                                autoComplete="new-password"
                                style={{
                                    ...inputFont,
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "12px 44px 12px 12px",
                                    borderRadius: Math.max(8, radius * 0.6),
                                    border: `1px solid ${borderColor}`,
                                    background: "transparent",
                                    color: textColor,
                                    outline: "none",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    startTransition(() =>
                                        setShowPassword((v) => !v)
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                                style={{
                                    position: "absolute",
                                    right: 8,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: 32,
                                    height: 32,
                                    border: "none",
                                    background: "transparent",
                                    padding: 0,
                                    margin: 0,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: textColor,
                                    opacity: 0.8,
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    focusable="false"
                                    style={{ display: "block" }}
                                >
                                    <path
                                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {showPassword ? (
                                        <path
                                            d="M4 4l16 16"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    ) : null}
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : null}

                {backendError ? (
                    <ErrorMessage
                        error={backendError}
                        showIcon={true}
                        icon="⚠️"
                        backgroundColor="#FEF2F2"
                        borderColor="#FECACA"
                        textColor="#991B1B"
                        iconColor="#991B1B"
                        borderRadius="10px"
                        padding="12px"
                        gap={10}
                        font={{ fontSize: "14px", lineHeight: "1.4em" }}
                    />
                ) : showError ? (
                    <div
                        role="alert"
                        style={{
                            ...errorFont,
                            color: errorColor,
                            background: "rgba(255, 0, 0, 0.06)",
                            border: `1px solid rgba(255, 0, 0, 0.18)`,
                            borderRadius: Math.max(8, radius * 0.6),
                            padding: "10px 12px",
                        }}
                    >
                        {error}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{
                        ...buttonFont,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        minHeight: 44,
                        border: "none",
                        cursor: canSubmit ? "pointer" : "not-allowed",
                        background: buttonColor || "#2563EB",
                        color: buttonTextColor || "#FFFFFF",
                        borderRadius: Math.max(10, radius * 0.7),
                        padding: "12px 18px",
                        minWidth: 160,
                        fontWeight: 600,
                        opacity: canSubmit ? 1 : 0.65,
                        textAlign: "center",
                    }}
                    aria-label={
                        mode === "login" ? buttonLabel : registerButtonLabel
                    }
                >
                    {mode === "login" ? buttonLabel : registerButtonLabel}
                </button>

                {enableRegister ? (
                    <button
                        type="button"
                        onClick={() => {
                            startTransition(() => {
                                setTouched(false)
                                setError("")
                                setMode((m) =>
                                    m === "login" ? "register" : "login"
                                )
                            })
                        }}
                        style={{
                            ...buttonFont,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            minHeight: 44,
                            background: "transparent",
                            border: `1px solid ${borderColor}`,
                            color: textColor,
                            borderRadius: Math.max(10, radius * 0.7),
                            padding: "12px 18px",
                            minWidth: 160,
                            fontWeight: 600,
                            cursor: "pointer",
                            opacity: 0.95,
                            textAlign: "center",
                        }}
                        aria-label={
                            mode === "login"
                                ? registerLinkLabel
                                : backToLoginLabel
                        }
                    >
                        {mode === "login"
                            ? registerLinkLabel
                            : backToLoginLabel}
                    </button>
                ) : null}

                <style>{`
                    form input::placeholder { color: ${placeholderColor}; opacity: 1; }
                    form input:focus { border-color: ${buttonColor}; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
                `}</style>
            </form>
        </div>
    )
}

