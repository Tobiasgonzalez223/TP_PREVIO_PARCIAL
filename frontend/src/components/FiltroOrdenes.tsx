import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type CSSProperties,
} from "react"

type FiltroOrdenesProps = {
    activoLabel: string
    estadoLabel: string
    prioridadLabel: string
    tecnicoLabel: string

    activoOptions: string[]
    estadoOptions: string[]
    prioridadOptions: string[]
    tecnicoOptions: string[]

    defaultActivo: string
    defaultEstado: string
    defaultPrioridad: string
    defaultTecnico: string

    showLabels: boolean
    gap: number
    padding: string
    borderRadius: string

    backgroundColor: string
    labelColor: string
    fieldBackground: string
    fieldTextColor: string
    borderColor: string

    labelFont: any
    fieldFont: any

    onFiltersChange?: (payload: {
        activo: string
        estado: string
        prioridad: string
        tecnico: string
    }) => void

    style?: CSSProperties
}

function sanitizeOptions(options: string[]): string[] {
    const list = Array.isArray(options) ? options : []
    const trimmed = list
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter((x) => x.length > 0)

    // Keep stable order, remove duplicates (case-sensitive)
    const seen = new Set<string>()
    const unique: string[] = []
    for (const item of trimmed) {
        if (seen.has(item)) continue
        seen.add(item)
        unique.push(item)
    }

    return unique.length > 0 ? unique : ["Todos"]
}

function ensureValueInOptions(value: string, options: string[]): string {
    if (options.includes(value)) return value
    return options[0] ?? ""
}

/**
 * @framerIntrinsicWidth 380
 * @framerIntrinsicHeight 200
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function FiltroOrdenes(props: FiltroOrdenesProps) {
    const {
        activoLabel,
        estadoLabel,
        prioridadLabel,
        tecnicoLabel,
        activoOptions,
        estadoOptions,
        prioridadOptions,
        tecnicoOptions,
        defaultActivo,
        defaultEstado,
        defaultPrioridad,
        defaultTecnico,
        showLabels,
        gap,
        padding,
        borderRadius,
        backgroundColor,
        labelColor,
        fieldBackground,
        fieldTextColor,
        borderColor,
        labelFont,
        fieldFont,
        onFiltersChange,
        style,
    } = props

    const options = useMemo(() => {
        return {
            activo: sanitizeOptions(activoOptions),
            estado: sanitizeOptions(estadoOptions),
            prioridad: sanitizeOptions(prioridadOptions),
            tecnico: sanitizeOptions(tecnicoOptions),
        }
    }, [activoOptions, estadoOptions, prioridadOptions, tecnicoOptions])

    const [activo, setActivo] = useState(() =>
        ensureValueInOptions(defaultActivo, options.activo)
    )
    const [estado, setEstado] = useState(() =>
        ensureValueInOptions(defaultEstado, options.estado)
    )
    const [prioridad, setPrioridad] = useState(() =>
        ensureValueInOptions(defaultPrioridad, options.prioridad)
    )
    const [tecnico, setTecnico] = useState(() =>
        ensureValueInOptions(defaultTecnico, options.tecnico)
    )

    // Sync when defaults/options change
    useEffect(() => {
        const next = ensureValueInOptions(defaultActivo, options.activo)
        startTransition(() => setActivo(next))
    }, [defaultActivo, options.activo])

    useEffect(() => {
        const next = ensureValueInOptions(defaultEstado, options.estado)
        startTransition(() => setEstado(next))
    }, [defaultEstado, options.estado])

    useEffect(() => {
        const next = ensureValueInOptions(defaultPrioridad, options.prioridad)
        startTransition(() => setPrioridad(next))
    }, [defaultPrioridad, options.prioridad])

    useEffect(() => {
        const next = ensureValueInOptions(defaultTecnico, options.tecnico)
        startTransition(() => setTecnico(next))
    }, [defaultTecnico, options.tecnico])

    const emit = useCallback(
        (next: {
            activo: string
            estado: string
            prioridad: string
            tecnico: string
        }) => {
            if (!onFiltersChange) return
            onFiltersChange(next)
        },
        [onFiltersChange]
    )

    useEffect(() => {
        emit({ activo, estado, prioridad, tecnico })
    }, [activo, estado, prioridad, tecnico, emit])

    const fieldBase: CSSProperties = useMemo(
        () => ({
            width: "100%",
            height: 40,
            borderRadius,
            border: `1px solid ${borderColor}`,
            background: fieldBackground,
            color: fieldTextColor,
            padding: "0 12px",
            outline: "none",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            ...fieldFont,
        }),
        [borderRadius, borderColor, fieldBackground, fieldTextColor, fieldFont]
    )

    const labelStyle: CSSProperties = useMemo(
        () => ({
            margin: 0,
            color: labelColor,
            ...labelFont,
        }),
        [labelColor, labelFont]
    )

    const rowStyle: CSSProperties = useMemo(
        () => ({
            display: "flex",
            flexDirection: "column",
            gap: 8,
        }),
        []
    )

    return (
        <section
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                padding,
                borderRadius,
                background: backgroundColor,
                display: "flex",
                flexDirection: "column",
                gap,
                overflow: "hidden",
            }}
            aria-label="Filtros de órdenes"
        >
            <div style={rowStyle}>
                {showLabels && <p style={labelStyle}>{activoLabel}</p>}
                <div style={{ position: "relative" }}>
                    <select
                        value={activo}
                        onChange={(e) => {
                            const next = ensureValueInOptions(
                                e.target.value,
                                options.activo
                            )
                            startTransition(() => setActivo(next))
                        }}
                        style={fieldBase}
                        aria-label={activoLabel}
                    >
                        {options.activo.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={rowStyle}>
                {showLabels && <p style={labelStyle}>{estadoLabel}</p>}
                <div style={{ position: "relative" }}>
                    <select
                        value={estado}
                        onChange={(e) => {
                            const next = ensureValueInOptions(
                                e.target.value,
                                options.estado
                            )
                            startTransition(() => setEstado(next))
                        }}
                        style={fieldBase}
                        aria-label={estadoLabel}
                    >
                        {options.estado.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={rowStyle}>
                {showLabels && <p style={labelStyle}>{prioridadLabel}</p>}
                <div style={{ position: "relative" }}>
                    <select
                        value={prioridad}
                        onChange={(e) => {
                            const next = ensureValueInOptions(
                                e.target.value,
                                options.prioridad
                            )
                            startTransition(() => setPrioridad(next))
                        }}
                        style={fieldBase}
                        aria-label={prioridadLabel}
                    >
                        {options.prioridad.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={rowStyle}>
                {showLabels && <p style={labelStyle}>{tecnicoLabel}</p>}
                <div style={{ position: "relative" }}>
                    <select
                        value={tecnico}
                        onChange={(e) => {
                            const next = ensureValueInOptions(
                                e.target.value,
                                options.tecnico
                            )
                            startTransition(() => setTecnico(next))
                        }}
                        style={fieldBase}
                        aria-label={tecnicoLabel}
                    >
                        {options.tecnico.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </section>
    )
}

// Framer metadata removed — not used in this project