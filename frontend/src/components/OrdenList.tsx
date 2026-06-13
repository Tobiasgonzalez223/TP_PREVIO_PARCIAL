import React, {
    startTransition,
    useCallback,
    useMemo,
    useState,
    type CSSProperties,
} from "react"
import ErrorMessage from "./Error"

type SortDir = "asc" | "desc"

type OrdenItem = {
    titulo: string
    activo: string
    solicitante: string
    tecnico: string
    prioridad: "Baja" | "Media" | "Alta" | string
    estado: "Abierta" | "En progreso" | "Cerrada" | string
    fecha: string
}

type SortKey = keyof OrdenItem

interface OrdenListProps {
    data: OrdenItem[]
    showFilters: boolean
    showPagination: boolean
    defaultPageSize: number

    backgroundColor: string
    headerBackgroundColor: string
    borderColor: string
    textColor: string
    mutedTextColor: string
    rowHoverColor: string

    headerFont: any
    cellFont: any
    backendError?: any
    onSelect?: (item: any) => void

    style?: CSSProperties
}

function safeString(v: any): string {
    if (v === null || v === undefined) return ""
    return String(v)
}

function normalize(v: string): string {
    return v.trim().toLowerCase()
}

function compareValues(a: any, b: any): number {
    const na = typeof a === "number" ? a : Number(a)
    const nb = typeof b === "number" ? b : Number(b)
    const aIsNum = Number.isFinite(na)
    const bIsNum = Number.isFinite(nb)
    if (aIsNum && bIsNum) return na - nb

    const da = Date.parse(a)
    const db = Date.parse(b)
    const aIsDate = Number.isFinite(da)
    const bIsDate = Number.isFinite(db)
    if (aIsDate && bIsDate) return da - db

    return safeString(a).localeCompare(safeString(b), "es", {
        numeric: true,
        sensitivity: "base",
    })
}

export default function OrdenList(props: OrdenListProps) {
    const {
        data,
        showFilters,
        showPagination,
        defaultPageSize,
        backgroundColor,
        headerBackgroundColor,
        borderColor,
        textColor,
        mutedTextColor,
        rowHoverColor,
        headerFont,
        cellFont,
        backendError,
        onSelect,
        style,
    } = props

    const pageSizeOptions = useMemo(() => {
        const base = [5, 10, 20, 50]
        if (!base.includes(defaultPageSize)) base.push(defaultPageSize)
        return Array.from(new Set(base)).sort((a, b) => a - b)
    }, [defaultPageSize])

    const [filterActivo, setFilterActivo] = useState<string>("Todos")
    const [filterEstado, setFilterEstado] = useState<string>("Todos")
    const [filterPrioridad, setFilterPrioridad] = useState<string>("Todos")
    const [filterTecnico, setFilterTecnico] = useState<string>("Todos")

    const [sortKey, setSortKey] = useState<SortKey>("fecha")
    const [sortDir, setSortDir] = useState<SortDir>("desc")

    const [pageSize, setPageSize] = useState<number>(defaultPageSize)
    const [page, setPage] = useState<number>(1)

    const uniqueOptions = useMemo(() => {
        const activos = new Set<string>()
        const estados = new Set<string>()
        const prioridades = new Set<string>()
        const tecnicos = new Set<string>()

        for (const item of data) {
            if (item?.activo) activos.add(item.activo)
            if (item?.estado) estados.add(item.estado)
            if (item?.prioridad) prioridades.add(item.prioridad)
            if (item?.tecnico) tecnicos.add(item.tecnico)
        }

        const toSorted = (s: Set<string>) =>
            Array.from(s).sort((a, b) =>
                a.localeCompare(b, "es", { sensitivity: "base" })
            )

        return {
            activos: toSorted(activos),
            estados: toSorted(estados),
            prioridades: toSorted(prioridades),
            tecnicos: toSorted(tecnicos),
        }
    }, [data])

    const filteredSorted = useMemo(() => {
        const filtered = data.filter((item) => {
            if (!item) return false

            const activoOk =
                filterActivo === "Todos" ||
                normalize(item.activo) === normalize(filterActivo)
            const estadoOk =
                filterEstado === "Todos" ||
                normalize(item.estado) === normalize(filterEstado)
            const prioridadOk =
                filterPrioridad === "Todos" ||
                normalize(item.prioridad) === normalize(filterPrioridad)
            const tecnicoOk =
                filterTecnico === "Todos" ||
                normalize(item.tecnico) === normalize(filterTecnico)

            return activoOk && estadoOk && prioridadOk && tecnicoOk
        })

        return [...filtered].sort((a, b) => {
            const v = compareValues(a?.[sortKey], b?.[sortKey])
            return sortDir === "asc" ? v : -v
        })
    }, [
        data,
        filterActivo,
        filterEstado,
        filterPrioridad,
        filterTecnico,
        sortKey,
        sortDir,
    ])

    const totalItems = filteredSorted.length
    const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)))

    const pageClamped = Math.min(Math.max(1, page), totalPages)
    const paged = useMemo(() => {
        const start = (pageClamped - 1) * pageSize
        const end = start + pageSize
        return filteredSorted.slice(start, end)
    }, [filteredSorted, pageClamped, pageSize])

    React.useEffect(() => {
        if (page !== pageClamped) startTransition(() => setPage(pageClamped))
    }, [page, pageClamped])

    const onHeaderClick = useCallback(
        (key: SortKey) => {
            startTransition(() => {
                if (sortKey === key) {
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                } else {
                    setSortKey(key)
                    setSortDir("asc")
                }
                setPage(1)
            })
        },
        [sortKey]
    )

    const thButtonStyle: CSSProperties = {
        appearance: "none",
        border: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        color: "inherit",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minWidth: 0,
    }

    const caret = (active: boolean, dir: SortDir) => {
        const opacity = active ? 1 : 0.35
        const label = active ? (dir === "asc" ? "▲" : "▼") : "↕"
        return (
            <span aria-hidden style={{ opacity, fontSize: 12, lineHeight: "12px" }}>
                {label}
            </span>
        )
    }

    const container: CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: backgroundColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
    }

    const topBar: CSSProperties = {
        padding: 12,
        borderBottom: `1px solid ${borderColor}`,
        display: showFilters ? "flex" : "none",
        gap: 10,
        alignItems: "flex-end",
        flexWrap: "wrap",
    }

    const labelStyle: CSSProperties = {
        ...cellFont,
        fontSize: cellFont?.fontSize ?? "13px",
        color: mutedTextColor,
        marginBottom: 6,
        display: "block",
    }

    const selectStyle: CSSProperties = {
        ...cellFont,
        height: 34,
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        background: "transparent",
        color: textColor,
        padding: "0 10px",
        minWidth: 160,
        outline: "none",
    }

    const tableWrap: CSSProperties = {
        position: "relative",
        flex: 1,
        overflow: "auto",
    }

    const tableStyle: CSSProperties = {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
    }

    const thStyle: CSSProperties = {
        position: "sticky",
        top: 0,
        zIndex: 1,
        background: headerBackgroundColor,
        borderBottom: `1px solid ${borderColor}`,
        padding: "10px 12px",
        textAlign: "left",
        ...headerFont,
        whiteSpace: "nowrap",
    }

    const tdStyle: CSSProperties = {
        padding: "10px 12px",
        borderBottom: `1px solid ${borderColor}`,
        ...cellFont,
        verticalAlign: "top",
        whiteSpace: "nowrap",
        maxWidth: 280,
        overflow: "hidden",
        textOverflow: "ellipsis",
    }

    const footer: CSSProperties = {
        padding: 12,
        borderTop: `1px solid ${borderColor}`,
        display: showPagination ? "flex" : "none",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
    }

    const buttonStyle: CSSProperties = {
        ...cellFont,
        height: 34,
        padding: "0 12px",
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        background: "transparent",
        color: textColor,
        cursor: "pointer",
    }

    const buttonDisabled: CSSProperties = {
        opacity: 0.5,
        cursor: "not-allowed",
    }

    return (
        <section style={{ ...container, ...style }} aria-label="Listado de órdenes">
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
            <div style={topBar} aria-label="Filtros">
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={labelStyle}>Activo</span>
                    <select
                        value={filterActivo}
                        onChange={(e) =>
                            startTransition(() => {
                                setFilterActivo(e.target.value)
                                setPage(1)
                            })
                        }
                        style={selectStyle}
                        aria-label="Filtrar por activo"
                    >
                        <option value="Todos">Todos</option>
                        {uniqueOptions.activos.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={labelStyle}>Estado</span>
                    <select
                        value={filterEstado}
                        onChange={(e) =>
                            startTransition(() => {
                                setFilterEstado(e.target.value)
                                setPage(1)
                            })
                        }
                        style={selectStyle}
                        aria-label="Filtrar por estado"
                    >
                        <option value="Todos">Todos</option>
                        {uniqueOptions.estados.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={labelStyle}>Prioridad</span>
                    <select
                        value={filterPrioridad}
                        onChange={(e) =>
                            startTransition(() => {
                                setFilterPrioridad(e.target.value)
                                setPage(1)
                            })
                        }
                        style={selectStyle}
                        aria-label="Filtrar por prioridad"
                    >
                        <option value="Todos">Todos</option>
                        {uniqueOptions.prioridades.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={labelStyle}>Técnico</span>
                    <select
                        value={filterTecnico}
                        onChange={(e) =>
                            startTransition(() => {
                                setFilterTecnico(e.target.value)
                                setPage(1)
                            })
                        }
                        style={selectStyle}
                        aria-label="Filtrar por técnico"
                    >
                        <option value="Todos">Todos</option>
                        {uniqueOptions.tecnicos.map((v) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    style={{
                        marginLeft: "auto",
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 220,
                    }}
                >
                    <span style={labelStyle}>Resultados</span>
                    <div
                        style={{
                            ...cellFont,
                            color: mutedTextColor,
                            lineHeight: "1.2em",
                        }}
                        aria-live="polite"
                    >
                        {totalItems} elemento{totalItems === 1 ? "" : "s"}
                    </div>
                </div>
            </div>

            <div style={tableWrap}>
                <table style={tableStyle} role="table" aria-label="Tabla de órdenes">
                    <thead>
                        <tr>
                            <th style={thStyle} scope="col" aria-sort={sortKey === "titulo" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                                <button style={thButtonStyle} onClick={() => onHeaderClick("titulo")} aria-label="Ordenar por título">
                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>Título</span>
                                    {caret(sortKey === "titulo", sortDir)}
                                </button>
                            </th>
                            <th style={thStyle} scope="col" aria-sort={sortKey === "activo" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                                <button style={thButtonStyle} onClick={() => onHeaderClick("activo")} aria-label="Ordenar por activo">
                                    <span>Activo</span>
                                    {caret(sortKey === "activo", sortDir)}
                                </button>
                            </th>
                            <th style={thStyle} scope="col" aria-sort={sortKey === "solicitante" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                                <button style={thButtonStyle} onClick={() => onHeaderClick("solicitante")} aria-label="Ordenar por solicitante">
                                    <span>Solicitante</span>
                                    {caret(sortKey === "solicitante", sortDir)}
                                </button>
                            </th>
                            <th style={thStyle} scope="col" aria-sort={sortKey === "tecnico" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                                <button style={thButtonStyle} onClick={() => onHeaderClick("tecnico")} aria-label="Ordenar por técnico">
                                    <span>Técnico</span>
                                    {caret(sortKey === "tecnico", sortDir)}
                                </button>
                            </th>
                            <th style={thStyle} scope="col" aria-sort={sortKey === "prioridad" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                                <button style={thButtonStyle} onClick={() => onHeaderClick("prioridad")} aria-label="Ordenar por prioridad">
                                    <span>Prioridad</span>
                                    {caret(sortKey === "prioridad", sortDir)}
                                </button>
                            </th>
                            <th style={thStyle} scope="col" aria-sort={sortKey === "estado" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                                <button style={thButtonStyle} onClick={() => onHeaderClick("estado")} aria-label="Ordenar por estado">
                                    <span>Estado</span>
                                    {caret(sortKey === "estado", sortDir)}
                                </button>
                            </th>
                            <th style={thStyle} scope="col" aria-sort={sortKey === "fecha" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                                <button style={thButtonStyle} onClick={() => onHeaderClick("fecha")} aria-label="Ordenar por fecha">
                                    <span>Fecha</span>
                                    {caret(sortKey === "fecha", sortDir)}
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ ...tdStyle, whiteSpace: "normal", color: mutedTextColor }}>
                                    No hay resultados para los filtros actuales.
                                </td>
                            </tr>
                        ) : (
                            paged.map((item, idx) => (
                                <tr
                                    key={`${item.titulo}-${item.fecha}-${idx}`}
                                    style={{ background: "transparent", cursor: onSelect ? "pointer" : "default" }}
                                    onClick={() => onSelect?.(item)}
                                    onMouseEnter={(e) => {
                                        ;(e.currentTarget as HTMLTableRowElement).style.background = rowHoverColor
                                    }}
                                    onMouseLeave={(e) => {
                                        ;(e.currentTarget as HTMLTableRowElement).style.background = "transparent"
                                    }}
                                >
                                    <td style={{ ...tdStyle, whiteSpace: "normal" }} title={item.titulo}>
                                        {item.titulo}
                                    </td>
                                    <td style={tdStyle} title={item.activo}>{item.activo}</td>
                                    <td style={tdStyle} title={item.solicitante}>{item.solicitante}</td>
                                    <td style={tdStyle} title={item.tecnico}>{item.tecnico}</td>
                                    <td style={tdStyle} title={item.prioridad}>{item.prioridad}</td>
                                    <td style={tdStyle} title={item.estado}>{item.estado}</td>
                                    <td style={tdStyle} title={item.fecha}>{item.fecha}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={footer} aria-label="Paginación">
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        style={{ ...buttonStyle, ...(pageClamped <= 1 ? buttonDisabled : null) }}
                        onClick={() => startTransition(() => setPage((p) => Math.max(1, p - 1)))}
                        disabled={pageClamped <= 1}
                        aria-label="Página anterior"
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        style={{ ...buttonStyle, ...(pageClamped >= totalPages ? buttonDisabled : null) }}
                        onClick={() => startTransition(() => setPage((p) => Math.min(totalPages, p + 1)))}
                        disabled={pageClamped >= totalPages}
                        aria-label="Página siguiente"
                    >
                        Siguiente
                    </button>
                    <span style={{ ...cellFont, color: mutedTextColor }} aria-live="polite">
                        Página {pageClamped} de {totalPages}
                    </span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ ...cellFont, color: mutedTextColor }}>Filas por página</span>
                    <select
                        value={String(pageSize)}
                        onChange={(e) => {
                            const next = Math.max(1, Number(e.target.value) || defaultPageSize)
                            startTransition(() => {
                                setPageSize(next)
                                setPage(1)
                            })
                        }}
                        style={{ ...selectStyle, minWidth: 110 }}
                        aria-label="Filas por página"
                    >
                        {pageSizeOptions.map((n) => (
                            <option key={n} value={String(n)}>{n}</option>
                        ))}
                    </select>
                </div>
            </div>
        </section>
    )
}
