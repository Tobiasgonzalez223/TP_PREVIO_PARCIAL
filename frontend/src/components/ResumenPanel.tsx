import * as React from "react"

type OrderStatusItem = {
    estado: string
    cantidad: number
    color: string
}

type AssetFailureItem = {
    activo: string
    fallas: number
}

interface ResumenPanelProps {
    titulo: string
    showTitle: boolean

    estados: OrderStatusItem[]
    urgentes: number
    sinTecnico: number
    activos: AssetFailureItem[]

    backgroundColor: string
    cardBackgroundColor: string
    borderColor: string
    textColor: string
    mutedTextColor: string

    titleFont: any
    labelFont: any
    numberFont: any

    radius: string
    padding: string
    gap: number

    style?: React.CSSProperties
}

function clampInt(n: number, min: number, max: number) {
    if (!Number.isFinite(n)) return min
    return Math.min(max, Math.max(min, Math.round(n)))
}

function formatCompact(n: number) {
    const value = Number(n)
    if (!Number.isFinite(value)) return "0"
    try {
        return new Intl.NumberFormat(undefined, { notation: "compact" }).format(
            value
        )
    } catch {
        return String(value)
    }
}

/**
 * ResumenPanel
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function ResumenPanel(props: ResumenPanelProps) {
    const {
        titulo,
        showTitle,
        estados,
        urgentes,
        sinTecnico,
        activos,
        backgroundColor,
        cardBackgroundColor,
        borderColor,
        textColor,
        mutedTextColor,
        titleFont,
        labelFont,
        numberFont,
        radius,
        padding,
        gap,
        style,
    } = props

    const safeGap = clampInt(typeof gap === 'number' ? gap : 20, 12, 64)

    const normalizedEstados = React.useMemo(() => {
        const list = Array.isArray(estados) ? estados : []
        return list
            .filter((s) => s && typeof s.estado === "string")
            .map((s) => ({
                estado: s.estado || "(Sin estado)",
                cantidad: Number.isFinite(Number(s.cantidad))
                    ? Number(s.cantidad)
                    : 0,
                color:
                    typeof s.color === "string" && s.color
                        ? s.color
                        : borderColor,
            }))
    }, [estados, borderColor])

    const totalOrdenes = React.useMemo(() => {
        return normalizedEstados.reduce(
            (acc, s) => acc + (Number.isFinite(s.cantidad) ? s.cantidad : 0),
            0
        )
    }, [normalizedEstados])

    const normalizedActivos = React.useMemo(() => {
        const list = Array.isArray(activos) ? activos : []
        const mapped = list
            .filter((a) => a && typeof a.activo === "string")
            .map((a) => ({
                activo: a.activo || "(Sin nombre)",
                fallas: Number.isFinite(Number(a.fallas))
                    ? Number(a.fallas)
                    : 0,
            }))

        // Sort desc, keep stable
        return mapped.slice().sort((a, b) => b.fallas - a.fallas)
    }, [activos])

    const isFixedWidth = !!(style && style.width === "100%")

    const Card: React.FC<{
        title: string
        value: string
        hint?: string
        accent?: string
    }> = ({ title, value, hint, accent }) => {
        return (
            <section
                style={{
                    position: "relative",
                    width: "100%",
                    minWidth: 0,
                    minHeight: 120,
                    boxSizing: "border-box",
                    background: cardBackgroundColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: radius,
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    overflow: "hidden",
                }}
                aria-label={title}
            >
                {accent ? (
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: accent,
                        }}
                    />
                ) : null}

                <div
                    style={{
                        ...labelFont,
                        color: mutedTextColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        minWidth: 0,
                    }}
                >
                    <span
                        style={{
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {title}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 10,
                    }}
                >
                    <span
                        style={{
                            ...numberFont,
                            color: textColor,
                            lineHeight: 1,
                            minWidth: 0,
                        }}
                    >
                        {value}
                    </span>
                    {hint ? (
                        <span
                            style={{
                                ...labelFont,
                                color: mutedTextColor,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {hint}
                        </span>
                    ) : null}
                </div>
            </section>
        )
    }

    return (
        <div
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                background: backgroundColor,
                border: `1px solid ${borderColor}`,
                borderRadius: radius,
                padding,
                overflow: "hidden",
                color: textColor,
                display: "flex",
                flexDirection: "column",
                gap: safeGap,
                maxWidth: "100%",
                ...(isFixedWidth ? {} : { minWidth: 0 }),
            }}
        >
            {showTitle ? (
                <header
                    style={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{ ...titleFont, color: textColor, minWidth: 0 }}
                    >
                        <span
                            style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "100%",
                            }}
                        >
                            {titulo}
                        </span>
                    </div>
                </header>
            ) : null}

            <div
                style={{
                    position: "relative",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: safeGap,
                    alignItems: "stretch",
                    gridAutoRows: "minmax(0, min-content)",
                }}
            >
                <Card
                    title="Órdenes (total)"
                    value={formatCompact(totalOrdenes)}
                    hint={
                        normalizedEstados.length
                            ? `${normalizedEstados.length} estados`
                            : "Sin datos"
                    }
                />
                <Card
                    title="Órdenes urgentes"
                    value={formatCompact(urgentes)}
                    accent="#FF5588"
                />
                <Card
                    title="Órdenes sin técnico"
                    value={formatCompact(sinTecnico)}
                    accent="#FFBB00"
                />
                <Card
                    title="Activos en seguimiento"
                    value={formatCompact(normalizedActivos.length)}
                    hint={normalizedActivos.length ? "Top fallas" : "Sin datos"}
                />
            </div>

            <section
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    background: cardBackgroundColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: radius,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
                aria-label="Órdenes por estado"
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                    }}
                >
                    <span style={{ ...labelFont, color: textColor }}>
                        Órdenes por estado
                    </span>
                    <span style={{ ...labelFont, color: mutedTextColor }}>
                        {formatCompact(totalOrdenes)} total
                    </span>
                </div>

                {normalizedEstados.length ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        {normalizedEstados.map((s, idx) => {
                            const pct =
                                totalOrdenes > 0
                                    ? Math.max(
                                          0,
                                          Math.min(1, s.cantidad / totalOrdenes)
                                      )
                                    : 0
                            return (
                                <div
                                    key={`${s.estado}-${idx}`}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 10,
                                            minWidth: 0,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                minWidth: 0,
                                            }}
                                        >
                                            <span
                                                aria-hidden="true"
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 999,
                                                    background: s.color,
                                                    flex: "0 0 auto",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    ...labelFont,
                                                    color: textColor,
                                                    minWidth: 0,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {s.estado}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                ...labelFont,
                                                color: mutedTextColor,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {formatCompact(s.cantidad)}
                                        </span>
                                    </div>

                                    <div
                                        aria-hidden="true"
                                        style={{
                                            width: "100%",
                                            height: 6,
                                            borderRadius: 999,
                                            background: borderColor,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${pct * 100}%`,
                                                height: "100%",
                                                background: s.color,
                                                borderRadius: 999,
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div style={{ ...labelFont, color: mutedTextColor }}>
                        Sin estados configurados.
                    </div>
                )}
            </section>

            <section
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    background: cardBackgroundColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: radius,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    overflow: "hidden",
                    boxSizing: "border-box",
                }}
                aria-label="Activos con más fallas"
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                    }}
                >
                    <span style={{ ...labelFont, color: textColor }}>
                        Activos con más fallas
                    </span>
                    <span style={{ ...labelFont, color: mutedTextColor }}>
                        {formatCompact(normalizedActivos.length)} items
                    </span>
                </div>

                {normalizedActivos.length ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {normalizedActivos.slice(0, 6).map((a, idx) => (
                            <div
                                key={`${a.activo}-${idx}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 8,
                                    minWidth: 0,
                                }}
                            >
                                <span
                                    style={{
                                        ...labelFont,
                                        color: textColor,
                                        minWidth: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {a.activo}
                                </span>
                                <span
                                    style={{
                                        ...labelFont,
                                        color: mutedTextColor,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {formatCompact(a.fallas)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ ...labelFont, color: mutedTextColor }}>
                        Sin activos configurados.
                    </div>
                )}
            </section>
        </div>
    )
}

// Removed Framer `addPropertyControls` metadata — not used in this project
