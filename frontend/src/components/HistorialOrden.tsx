import React, { useMemo, type CSSProperties } from "react"

type DateFormatMode = "short" | "medium" | "long" | "raw"

type Registro = {
    accion: string
    usuario: string
    fechaHora: string
    valorAnterior: string
    valorNuevo: string
}

interface HistorialOrdenProps {
    registros?: Registro[]
    mostrarEncabezados?: boolean
    encabezados?: {
        accion: string
        usuario: string
        fechaHora: string
        valorAnterior: string
        valorNuevo: string
    }
    separadorColor?: string
    fondoColor?: string
    textoColor?: string
    encabezadoFondo?: string
    encabezadoTexto?: string
    bordeRedondeado?: string
    padding?: string
    gap?: number
    maxAltura?: number
    scroll?: boolean
    fuenteEncabezado?: CSSProperties
    fuenteFila?: CSSProperties
    dateLocale?: string
    dateOptions?: DateFormatMode
    style?: CSSProperties
}

const defaultEncabezados = {
    accion: "Acción",
    usuario: "Usuario",
    fechaHora: "Fecha/Hora",
    valorAnterior: "Valor anterior",
    valorNuevo: "Valor nuevo",
}

function formatMaybeDate(
    input: string | undefined,
    locale: string | undefined,
    mode: DateFormatMode | undefined
) {
    if (!input) return ""
    if (mode === "raw") return input

    const d = new Date(input)
    if (Number.isNaN(d.getTime())) return input

    const options: Intl.DateTimeFormatOptions =
        mode === "short"
            ? {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
              }
            : mode === "medium"
              ? {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }
              : {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }

    try {
        return new Intl.DateTimeFormat(locale || undefined, options).format(d)
    } catch {
        return d.toLocaleString()
    }
}

/**
 * HistorialOrden
 *
 * @framerIntrinsicWidth 640
 * @framerIntrinsicHeight 280
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function HistorialOrden(props: HistorialOrdenProps) {
    const {
        registros = [],
        mostrarEncabezados = true,
        encabezados = defaultEncabezados,
        separadorColor = "#EEEEEE",
        fondoColor = "#FFFFFF",
        textoColor = "#000000",
        encabezadoFondo = "#F5F5F5",
        encabezadoTexto = "#000000",
        bordeRedondeado = "12px",
        padding = "16px",
        gap = 10,
        maxAltura = 260,
        scroll = true,
        fuenteEncabezado = {},
        fuenteFila = {},
        dateLocale = "es-ES",
        dateOptions = "medium",
        style,
    } = props

    const rows = useMemo(() => {
        return (registros || []).map((r: Registro, idx: number) => {
            const fecha = formatMaybeDate(r.fechaHora, dateLocale, dateOptions)
            return {
                ...r,
                fecha,
                _key: `${idx}-${r.accion}-${r.usuario}-${r.fechaHora}`,
            }
        })
    }, [registros, dateLocale, dateOptions])

    const isWidth100 = !!style && style.width === "100%"
    const isHeight100 = !!style && style.height === "100%"

    const commonCell: CSSProperties = {
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    }

    const gridTemplate = "1.1fr 1fr 1.2fr 1.2fr 1.2fr"

    const containerStyle: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        background: fondoColor,
        color: textoColor,
        borderRadius: bordeRedondeado,
        padding,
        overflow: "hidden",
        ...style,
    }

    const listStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap,
        width: "100%",
        height: scroll
            ? isHeight100
                ? "100%"
                : maxAltura > 0
                  ? maxAltura
                  : undefined
            : undefined,
        overflowY: scroll ? "auto" : "visible",
        overflowX: "hidden",
        boxSizing: "border-box",
        paddingRight: scroll ? 2 : 0,
    }

    return (
        <section
            aria-label="Historial de orden"
            style={{
                ...containerStyle,
                ...(isWidth100 ? null : { minWidth: "min(640px, 100%)" }),
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap,
                    width: "100%",
                    height: "100%",
                }}
            >
                {mostrarEncabezados && (
                    <div
                        role="row"
                        aria-label="Encabezados"
                        style={{
                            display: "grid",
                            gridTemplateColumns: gridTemplate,
                            gap: 12,
                            alignItems: "center",
                            background: encabezadoFondo,
                            color: encabezadoTexto,
                            borderRadius: 8,
                            padding: "10px 12px",
                            boxSizing: "border-box",
                            flex: "0 0 auto",
                            ...fuenteEncabezado,
                        }}
                    >
                        <span style={{ ...commonCell }}>
                            {encabezados.accion}
                        </span>
                        <span style={{ ...commonCell }}>
                            {encabezados.usuario}
                        </span>
                        <span style={{ ...commonCell }}>
                            {encabezados.fechaHora}
                        </span>
                        <span style={{ ...commonCell }}>
                            {encabezados.valorAnterior}
                        </span>
                        <span style={{ ...commonCell }}>
                            {encabezados.valorNuevo}
                        </span>
                    </div>
                )}

                <div
                    role="table"
                    aria-label="Registros"
                    style={{
                        ...listStyle,
                        flex: scroll ? "1 1 auto" : "0 0 auto",
                        minHeight: scroll && isHeight100 ? 0 : undefined,
                    }}
                >
                    {rows.length === 0 ? (
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                padding: "14px 12px",
                                border: `1px dashed ${separadorColor}`,
                                borderRadius: 8,
                                boxSizing: "border-box",
                                opacity: 0.75,
                                ...fuenteFila,
                            }}
                        >
                            Sin registros
                        </div>
                    ) : (
                        rows.map((r) => (
                            <div
                                key={r._key}
                                role="row"
                                style={{
                                    position: "relative",
                                    display: "grid",
                                    gridTemplateColumns: gridTemplate,
                                    gap: 12,
                                    alignItems: "center",
                                    padding: "12px",
                                    borderRadius: 8,
                                    border: `1px solid ${separadorColor}`,
                                    background: "transparent",
                                    boxSizing: "border-box",
                                    ...fuenteFila,
                                }}
                            >
                                <span
                                    style={{ ...commonCell }}
                                    title={r.accion}
                                >
                                    {r.accion}
                                </span>
                                <span
                                    style={{ ...commonCell }}
                                    title={r.usuario}
                                >
                                    {r.usuario}
                                </span>
                                <span style={{ ...commonCell }} title={r.fecha}>
                                    {r.fecha}
                                </span>
                                <span
                                    style={{ ...commonCell }}
                                    title={r.valorAnterior}
                                >
                                    {r.valorAnterior}
                                </span>
                                <span
                                    style={{ ...commonCell }}
                                    title={r.valorNuevo}
                                >
                                    {r.valorNuevo}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}


