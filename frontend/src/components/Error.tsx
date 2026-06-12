import * as React from "react"

type ErrorMessageProps = {
    message?: string
    showIcon: boolean
    icon: string
    backgroundColor: string
    borderColor: string
    textColor: string
    iconColor: string
    borderRadius: string
    padding: string
    gap: number
    font: any
    style?: React.CSSProperties
    /** Optional raw error object from backend (axios error or response) */
    error?: any
    /** Fallback message when no other message available */
    fallback?: string
}

/**
 * ErrorMessage
 *
 * @framerIntrinsicWidth 320
 * @framerIntrinsicHeight 56
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function ErrorMessage(props: ErrorMessageProps) {
    const {
        message,
        showIcon,
        icon,
        backgroundColor,
        borderColor,
        textColor,
        iconColor,
        borderRadius,
        padding,
        gap,
        font,
        style,
        error,
        fallback = "Ha ocurrido un error. Inténtalo de nuevo.",
    } = props

    const isFixedWidth = !!style && style.width === "100%"

    return (
        <div
            role="alert"
            aria-live="polite"
            style={{
                position: "relative",
                width: "100%",
                ...(isFixedWidth ? null : { minWidth: "max-content" }),
                boxSizing: "border-box",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                gap,
                padding,
                borderRadius,
                background: backgroundColor,
                border: `1px solid ${borderColor}`,
                color: textColor,
                ...font,
                ...style,
            }}
        >
            {showIcon && (
                <span
                    aria-hidden="true"
                    style={{
                        flex: "0 0 auto",
                        lineHeight: 1,
                        color: iconColor,
                        fontSize: 16,
                        marginTop: 1,
                    }}
                >
                    {icon}
                </span>
            )}
            <span
                style={{
                    flex: "1 1 auto",
                    minWidth: 0,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                }}
            >
                {getMessage(message, error, fallback)}
            </span>
        </div>
    )
}

function getMessage(explicitMessage?: string, err?: any, fallback?: string) {
    if (explicitMessage) return explicitMessage
    if (!err) return fallback

    // Axios-style error: err.response.data or err.response.status
    const resp = err?.response || err
    const data = resp?.data || resp || {}
    const code = data?.code ?? resp?.status ?? data?.status ?? data?.errorCode
    const serverMessage =
        data?.error ?? data?.message ?? data?.msg ?? err?.message ?? String(err)

    if (code) {
        switch (String(code)) {
            case "400":
            case "BAD_REQUEST":
                return serverMessage || "Solicitud inválida. Verifica los datos."
            case "401":
            case "UNAUTHORIZED":
                return serverMessage || "No autorizado. Inicia sesión nuevamente."
            case "403":
            case "FORBIDDEN":
                return serverMessage || "No tenés permisos para realizar esta acción."
            case "404":
            case "NOT_FOUND":
                return serverMessage || "Recurso no encontrado."
            case "409":
            case "CONFLICT":
                return serverMessage || "Conflicto en la operación."
            case "422":
            case "VALIDATION_ERROR":
                return serverMessage || "Datos inválidos. Revisá los campos."
            case "500":
            case "INTERNAL_ERROR":
            default:
                return serverMessage || fallback
        }
    }

    return serverMessage || fallback
}

// Removed Framer property controls to avoid runtime errors in the app.
