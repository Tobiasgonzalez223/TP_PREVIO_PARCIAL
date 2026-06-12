import React, {
    startTransition,
    useCallback,
    useMemo,
    useState,
    type CSSProperties,
} from "react"
import ErrorMessage from "./Error"

type Priority = "Baja" | "Media" | "Alta" | "Crítica"
type Status = "Abierta" | "En progreso" | "En espera" | "Resuelta" | "Cancelada"

interface OrderInfo {
    activo: string
    solicitante: string
    tecnico: string
    prioridad: Priority
    estado: Status
    fechaCreacion: string
    fechaActualizacion: string
    fechaVencimiento: string
}

interface HistoryItem {
    accion: string
    usuario: string
    fechaHora: string
    valorAnterior: string
    valorNuevo: string
}

interface OrdenDetailProps {
    titulo: string
    orden: OrderInfo
    historial: HistoryItem[]

    tecnicosDisponibles: string[]
    asignarModalTitulo: string
    asignarModalPlaceholder: string
    asignarModalConfirmarLabel: string
    asignarModalCancelarLabel: string

    backgroundColor: string
    surfaceColor: string
    borderColor: string
    textColor: string
    mutedTextColor: string
    accentColor: string
    dangerColor: string

    titleFont: any
    labelFont: any
    valueFont: any
    buttonFont: any

    radius: number
    padding: number
    gap: number
    maxHistoryHeight: number
    showHistory: boolean

    asignarLabel: string
    cancelarLabel: string
    resolverLabel: string

    onAsignar: (event: any) => void
    onCancelar: (event: any) => void
    onResolver: (event: any) => void
    backendError?: any

    style?: CSSProperties
}

function safeFormatDate(value: string, locale: string) {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    try {
        return d.toLocaleString(locale)
    } catch {
        return d.toISOString()
    }
}

/**
 * OrdenDetail
 *
 * @framerIntrinsicWidth 720
 * @framerIntrinsicHeight 520
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function OrdenDetail(props: OrdenDetailProps) {
    const {
        titulo,
        orden,
        historial,
        tecnicosDisponibles,
        asignarModalTitulo,
        asignarModalPlaceholder,
        asignarModalConfirmarLabel,
        asignarModalCancelarLabel,
        backgroundColor,
        surfaceColor,
        borderColor,
        textColor,
        mutedTextColor,
        accentColor,
        dangerColor,
        titleFont,
        labelFont,
        valueFont,
        buttonFont,
        radius,
        padding,
        gap,
        maxHistoryHeight,
        showHistory,
        asignarLabel,
        cancelarLabel,
        resolverLabel,
        onAsignar,
        onCancelar,
        onResolver,
        backendError,
        style,
    } = props

    const locale = useMemo(() => {
        if (typeof window === "undefined") return "es-ES"
        return window.navigator?.language || "es-ES"
    }, [])

    const [pressed, setPressed] = useState<
        "asignar" | "cancelar" | "resolver" | null
    >(null)
    const [assignOpen, setAssignOpen] = useState(false)
    const [techListOpen, setTechListOpen] = useState(false)
    const [currentTech, setCurrentTech] = useState(orden.tecnico || "")
    const [selectedTech, setSelectedTech] = useState(orden.tecnico || "")

    React.useEffect(() => {
        startTransition(() => {
            setCurrentTech(orden.tecnico || "")
            setSelectedTech(orden.tecnico || "")
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orden.tecnico])

    const infoRows = useMemo(
        () => [
            { label: "Activo", value: orden.activo },
            { label: "Solicitante", value: orden.solicitante },
            { label: "Técnico", value: currentTech || "—" },
            { label: "Prioridad", value: orden.prioridad },
            { label: "Estado", value: orden.estado },
            {
                label: "Creación",
                value: safeFormatDate(orden.fechaCreacion, locale),
            },
            {
                label: "Actualización",
                value: safeFormatDate(orden.fechaActualizacion, locale),
            },
            {
                label: "Vencimiento",
                value: safeFormatDate(orden.fechaVencimiento, locale),
            },
        ],
        [orden, locale, currentTech]
    )

    const buttonBase: CSSProperties = useMemo(
        () => ({
            ...buttonFont,
            borderRadius: Math.max(6, radius - 2),
            padding: "10px 12px",
            border: `1px solid ${borderColor}`,
            background: surfaceColor,
            color: textColor,
            cursor: "pointer",
            outline: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            userSelect: "none",
            transition:
                "transform 0.08s ease, background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease",
        }),
        [buttonFont, radius, borderColor, surfaceColor, textColor]
    )

    const handleAssign = useCallback((e: any) => {
        startTransition(() => setPressed("asignar"))
        startTransition(() => {
            setAssignOpen(true)
            setTechListOpen(false)
        })
        if (typeof window !== "undefined") {
            window.setTimeout(
                () => startTransition(() => setPressed(null)),
                120
            )
        } else {
            startTransition(() => setPressed(null))
        }
    }, [])

    const closeAssign = useCallback(() => {
        startTransition(() => setAssignOpen(false))
    }, [])

    const confirmAssign = useCallback(() => {
        const tech = selectedTech?.trim()
        startTransition(() => {
            setCurrentTech(tech)
            setAssignOpen(false)
        })
        onAsignar?.({ tecnico: tech })
    }, [onAsignar, selectedTech])

    const handleCancel = useCallback(
        (e: any) => {
            startTransition(() => setPressed("cancelar"))
            onCancelar?.(e)
            if (typeof window !== "undefined") {
                window.setTimeout(
                    () => startTransition(() => setPressed(null)),
                    120
                )
            } else {
                startTransition(() => setPressed(null))
            }
        },
        [onCancelar]
    )

    const handleResolve = useCallback(
        (e: any) => {
            startTransition(() => setPressed("resolver"))
            onResolver?.(e)
            if (typeof window !== "undefined") {
                window.setTimeout(
                    () => startTransition(() => setPressed(null)),
                    120
                )
            } else {
                startTransition(() => setPressed(null))
            }
        },
        [onResolver]
    )

    const isThumbnail = false

    return (
        <section
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                background: backgroundColor,
                color: textColor,
                borderRadius: radius,
                border: `1px solid ${borderColor}`,
                overflow: "hidden",
            }}
            aria-label="Detalle de orden"
        >
            {backendError ? (
                <div style={{ padding: 16 }}>
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
                </div>
            ) : null}
            {assignOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={asignarModalTitulo}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") closeAssign()
                    }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        zIndex: 10,
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeAssign()
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: 420,
                            background: backgroundColor,
                            border: `1px solid ${borderColor}`,
                            borderRadius: radius,
                            overflow: "hidden",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                        }}
                    >
                        <div
                            style={{
                                padding: 16,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    ...titleFont,
                                    fontSize:
                                        (titleFont?.fontSize as any) || "20px",
                                    color: textColor,
                                }}
                            >
                                {asignarModalTitulo}
                            </div>
                            <div
                                style={{ ...labelFont, color: mutedTextColor }}
                            >
                                {asignarModalPlaceholder}
                            </div>
                            <div style={{ position: "relative" }}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        startTransition(() =>
                                            setTechListOpen((v) => !v)
                                        )
                                    }
                                    style={{
                                        ...valueFont,
                                        width: "100%",
                                        padding: "10px 12px",
                                        borderRadius: Math.max(8, radius - 2),
                                        border: `1px solid ${borderColor}`,
                                        background: surfaceColor,
                                        color: textColor,
                                        outline: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 10,
                                    }}
                                    aria-label="Seleccionar técnico"
                                    aria-haspopup="listbox"
                                    aria-expanded={techListOpen}
                                >
                                    <span
                                        style={{
                                            minWidth: 0,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {selectedTech?.trim()
                                            ? selectedTech
                                            : "Seleccionar…"}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            ...labelFont,
                                            color: mutedTextColor,
                                        }}
                                    >
                                        {techListOpen ? "▲" : "▼"}
                                    </span>
                                </button>

                                {techListOpen && (
                                    <div
                                        role="listbox"
                                        aria-label="Lista de técnicos"
                                        style={{
                                            marginTop: 8,
                                            width: "100%",
                                            background: backgroundColor,
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: Math.max(
                                                8,
                                                radius - 2
                                            ),
                                            overflow: "hidden",
                                            maxHeight: 220,
                                            overflowY: "auto",
                                        }}
                                    >
                                        {(tecnicosDisponibles?.length
                                            ? tecnicosDisponibles
                                            : ["—"]
                                        ).map((t, i) => {
                                            const value = t === "—" ? "" : t
                                            const isSelected =
                                                (selectedTech || "") === value
                                            return (
                                                <button
                                                    key={`${t}-${i}`}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    onClick={() => {
                                                        startTransition(() => {
                                                            setSelectedTech(
                                                                value
                                                            )
                                                            setTechListOpen(
                                                                false
                                                            )
                                                        })
                                                    }}
                                                    style={{
                                                        ...valueFont,
                                                        width: "100%",
                                                        padding: "10px 12px",
                                                        background: isSelected
                                                            ? "rgba(0,0,0,0.04)"
                                                            : "transparent",
                                                        border: "none",
                                                        borderTop:
                                                            i === 0
                                                                ? "none"
                                                                : `1px solid ${borderColor}`,
                                                        textAlign: "left",
                                                        cursor: value
                                                            ? "pointer"
                                                            : "not-allowed",
                                                        color: value
                                                            ? textColor
                                                            : mutedTextColor,
                                                    }}
                                                    disabled={!value}
                                                >
                                                    {t}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    justifyContent: "flex-end",
                                    marginTop: 6,
                                }}
                            >
                                <button
                                    type="button"
                                    style={{ ...buttonBase }}
                                    onClick={closeAssign}
                                    aria-label="Cerrar asignación"
                                >
                                    {asignarModalCancelarLabel}
                                </button>
                                <button
                                    type="button"
                                    style={{
                                        ...buttonBase,
                                        borderColor: accentColor,
                                        background: accentColor,
                                        color: "#FFFFFF",
                                    }}
                                    onClick={confirmAssign}
                                    aria-label="Confirmar asignación"
                                    disabled={!selectedTech?.trim()}
                                >
                                    {asignarModalConfirmarLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap,
                    padding,
                }}
            >
                <header
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: 12,
                        }}
                    >
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    ...titleFont,
                                    color: textColor,
                                    margin: 0,
                                    minWidth: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {titulo}
                            </div>
                            <div
                                style={{
                                    ...labelFont,
                                    color: mutedTextColor,
                                    marginTop: 4,
                                }}
                            >
                                {orden.estado} · {orden.prioridad}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexWrap: "wrap",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                type="button"
                                style={{
                                    ...buttonBase,
                                    borderColor:
                                        pressed === "asignar"
                                            ? accentColor
                                            : borderColor,
                                    background:
                                        pressed === "asignar"
                                            ? "rgba(0,0,0,0.03)"
                                            : surfaceColor,
                                    transform:
                                        pressed === "asignar"
                                            ? "scale(0.98)"
                                            : "scale(1)",
                                }}
                                onClick={handleAssign}
                                aria-label="Asignar técnico"
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 999,
                                        background: accentColor,
                                    }}
                                />
                                {asignarLabel}
                            </button>

                            <button
                                type="button"
                                style={{
                                    ...buttonBase,
                                    borderColor:
                                        pressed === "cancelar"
                                            ? dangerColor
                                            : borderColor,
                                    color: dangerColor,
                                    background:
                                        pressed === "cancelar"
                                            ? "rgba(0,0,0,0.03)"
                                            : surfaceColor,
                                    transform:
                                        pressed === "cancelar"
                                            ? "scale(0.98)"
                                            : "scale(1)",
                                }}
                                onClick={handleCancel}
                                aria-label="Cancelar orden"
                            >
                                {cancelarLabel}
                            </button>

                            <button
                                type="button"
                                style={{
                                    ...buttonBase,
                                    borderColor:
                                        pressed === "resolver"
                                            ? accentColor
                                            : borderColor,
                                    background:
                                        pressed === "resolver"
                                            ? accentColor
                                            : accentColor,
                                    color: "#FFFFFF",
                                    transform:
                                        pressed === "resolver"
                                            ? "scale(0.98)"
                                            : "scale(1)",
                                    opacity: pressed === "resolver" ? 0.92 : 1,
                                }}
                                onClick={handleResolve}
                                aria-label="Resolver orden"
                            >
                                {resolverLabel}
                            </button>
                        </div>
                    </div>
                </header>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: isThumbnail
                            ? "1fr"
                            : "repeat(2, minmax(0, 1fr))",
                        gap: 12,
                    }}
                >
                    {infoRows.map((row) => (
                        <div
                            key={row.label}
                            style={{
                                background: surfaceColor,
                                border: `1px solid ${borderColor}`,
                                borderRadius: Math.max(8, radius - 2),
                                padding: 12,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                minWidth: 0,
                            }}
                        >
                            <div
                                style={{ ...labelFont, color: mutedTextColor }}
                            >
                                {row.label}
                            </div>
                            <div
                                style={{
                                    ...valueFont,
                                    color: textColor,
                                    minWidth: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {row.value || "—"}
                            </div>
                        </div>
                    ))}
                </div>

                {showHistory && (
                    <section
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            minHeight: 0,
                        }}
                        aria-label="Historial"
                    >
                        <div style={{ ...labelFont, color: mutedTextColor }}>
                            Historial
                        </div>
                        <div
                            style={{
                                background: surfaceColor,
                                border: `1px solid ${borderColor}`,
                                borderRadius: Math.max(8, radius - 2),
                                overflow: "hidden",
                                minHeight: 0,
                            }}
                        >
                            <div
                                style={{
                                    maxHeight: Math.max(120, maxHistoryHeight),
                                    overflowY: "auto",
                                    WebkitOverflowScrolling: "touch",
                                }}
                                role="list"
                                aria-label="Lista de acciones"
                            >
                                {historial.length === 0 ? (
                                    <div
                                        style={{
                                            padding: 14,
                                            ...valueFont,
                                            color: mutedTextColor,
                                        }}
                                    >
                                        Sin acciones registradas.
                                    </div>
                                ) : (
                                    historial.map((item, idx) => (
                                        <div
                                            key={`${item.accion}-${idx}`}
                                            role="listitem"
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: isThumbnail
                                                    ? "1fr"
                                                    : "1.1fr 0.9fr 1.2fr",
                                                gap: 10,
                                                padding: 14,
                                                borderTop:
                                                    idx === 0
                                                        ? "none"
                                                        : `1px solid ${borderColor}`,
                                                alignItems: "start",
                                            }}
                                        >
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        ...valueFont,
                                                        color: textColor,
                                                        minWidth: 0,
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                    }}
                                                >
                                                    {item.accion || "—"}
                                                </div>
                                                <div
                                                    style={{
                                                        ...labelFont,
                                                        color: mutedTextColor,
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    {item.valorAnterior || "—"}{" "}
                                                    → {item.valorNuevo || "—"}
                                                </div>
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        ...labelFont,
                                                        color: mutedTextColor,
                                                    }}
                                                >
                                                    Usuario
                                                </div>
                                                <div
                                                    style={{
                                                        ...valueFont,
                                                        color: textColor,
                                                        minWidth: 0,
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                    }}
                                                >
                                                    {item.usuario || "—"}
                                                </div>
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        ...labelFont,
                                                        color: mutedTextColor,
                                                    }}
                                                >
                                                    Fecha/Hora
                                                </div>
                                                <div
                                                    style={{
                                                        ...valueFont,
                                                        color: textColor,
                                                    }}
                                                >
                                                    {safeFormatDate(
                                                        item.fechaHora,
                                                        locale
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </section>
    )
}


