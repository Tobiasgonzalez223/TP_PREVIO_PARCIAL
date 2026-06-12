import * as React from "react"

// ViewKey and props typings removed to keep this file as plain JSX

const viewMeta = [
    { key: "login", label: "Ingresar" },
    { key: "listado", label: "Listado de Órdenes" },
    { key: "detalle", label: "Detalle de Orden" },
    { key: "formulario", label: "Formulario de Orden" },
    { key: "resumen", label: "Resumen Administrativo" },
    { key: "historial", label: "Historial de Orden" },
]

function isValidViewKey(key: any): boolean {
    return viewMeta.some((v) => v.key === key)
}

/**
 * AppShell
 *
 * @framerIntrinsicWidth 1000
 * @framerIntrinsicHeight 700
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function AppShell(props: any) {
    const {
        initialView,
        loginView = null,
        ordenListView = null,
        ordenDetailView = null,
        ordenFormView = null,
        resumenView = null,
        historialView = null,
        backgroundColor,
        navBackgroundColor,
        borderColor,
        textColor,
        activeTextColor,
        buttonBackgroundColor,
        buttonHoverBackgroundColor,
        navHeight = 56,
        navPadding = "8px 12px",
        contentPadding = "16px",
        navFont,
        showViewTitle,
        titleFont,
        notFoundTitle,
        notFoundBody,
        notFoundFont,
        style,
    } = props

    const [currentView, setCurrentView] = React.useState(initialView)
    const [hoveredKey, setHoveredKey] = React.useState<string | null>(null)

    React.useEffect(() => {
        React.startTransition(() => setCurrentView(initialView))
    }, [initialView])

    const currentMeta = React.useMemo(() => {
        return viewMeta.find((v) => v.key === currentView) || null
    }, [currentView])

    const viewNode = React.useMemo(() => {
        if (!isValidViewKey(currentView)) return null
        switch (currentView) {
            case "login":
                return loginView
            case "listado":
                return ordenListView
            case "detalle":
                return ordenDetailView
            case "formulario":
                return ordenFormView
            case "resumen":
                return resumenView
            case "historial":
                return historialView
            default:
                return null
        }
    }, [currentView, historialView, loginView, ordenDetailView, ordenFormView, ordenListView, resumenView])

    const handleNavigate = React.useCallback((key: string) => {
        React.startTransition(() => setCurrentView(key))
    }, [setCurrentView])

    const renderContent = () => {
        if (!isValidViewKey(currentView) || !viewNode) {
            return (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        gap: 10,
                        padding: "24px",
                        boxSizing: "border-box",
                    }}
                    role="status"
                    aria-live="polite"
                >
                    <div style={{ ...notFoundFont, color: textColor }}>{notFoundTitle}</div>
                    <div style={{ ...notFoundFont, color: textColor, opacity: 0.7 }}>{notFoundBody}</div>
                </div>
            )
        }

        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    boxSizing: "border-box",
                }}
            >
                {showViewTitle && (
                    <div style={{ ...titleFont, color: textColor }}>{currentMeta?.label}</div>
                )}
                <div style={{ width: "100%", height: "100%", minHeight: 0 }}>{viewNode}</div>
            </div>
        )
    }

    const isFixedWidth = !!(style && style.width === "100%")
    const isFixedHeight = !!(style && style.height === "100%")

    const computedNavWidth = 260

    return (
        <div
            style={{
                ...style,
                position: "relative",
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "row",
                background: backgroundColor,
                color: textColor,
                overflow: "hidden",
                boxSizing: "border-box",
                ...(isFixedWidth ? null : { minWidth: 320 }),
                ...(isFixedHeight ? null : { minHeight: 320 }),
            }}
        >
            <nav
                aria-label="Navegación"
                style={{
                    width: computedNavWidth,
                    flex: "0 0 auto",
                    display: "flex",
                    flexDirection: 'column',
                    alignItems: "stretch",
                    gap: 8,
                    padding: navPadding,
                    background: navBackgroundColor,
                    borderRight: `1px solid ${borderColor}`,
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                    boxSizing: "border-box",
                    minHeight: '100vh'
                }}
            >
                {viewMeta.map((item) => {
                    const isActive = item.key === currentView
                    const isHovered = item.key === hoveredKey
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => handleNavigate(item.key)}
                            onMouseEnter={() => {
                                React.startTransition(() => setHoveredKey(item.key))
                            }}
                            onMouseLeave={() => {
                                React.startTransition(() => setHoveredKey(null))
                            }}
                            style={{
                                ...navFont,
                                textAlign: 'left',
                                appearance: "none",
                                border: "none",
                                background: isHovered ? buttonHoverBackgroundColor : 'transparent',
                                color: isActive ? activeTextColor : textColor,
                                padding: "12px 16px",
                                borderRadius: 8,
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                width: '100%',
                                outline: "none",
                            }}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            <main
                style={{
                    flex: "1 1 auto",
                    width: "100%",
                    minHeight: '100vh',
                    padding: contentPadding,
                    boxSizing: "border-box",
                    overflow: "auto",
                    display: 'flex',
                    alignItems: 'stretch',
                }}
            >
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}

// End of AppShell

