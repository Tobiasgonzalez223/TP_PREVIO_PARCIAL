import type { CSSProperties, FormEvent } from "react"
import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import ErrorMessage from "./Error"

type PriorityValue = "Baja" | "Media" | "Alta" | string

interface OrdenFormProps {
    activoLabel: string
    activoPlaceholder: string
    activos?: string[]
    tituloLabel: string
    tituloPlaceholder: string
    descripcionLabel: string
    descripcionPlaceholder: string

    prioridadLabel: string
    prioridades: string[]
    prioridadInicial: string

    tecnicoLabel: string
    tecnicos: string[]
    tecnicoInicial: string

    confirmarLabel: string
    resetOnConfirm: boolean
    showDebug: boolean

    backgroundColor: string
    textColor: string
    subtleBackgroundColor: string
    borderColor: string
    buttonColor: string
    buttonTextColor: string

    labelFont: any
    inputFont: any
    buttonFont: any

    radius: number
    padding: string
    gap: number

    onConfirm: (event?: any) => void
    backendError?: any

    style?: CSSProperties
}

/**
 * OrdenForm
 *
 * @framerIntrinsicWidth 420
 * @framerIntrinsicHeight 360
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function OrdenForm(props: OrdenFormProps) {
    const {
        activoLabel,
        activoPlaceholder,
        activos,
        tituloLabel,
        tituloPlaceholder,
        descripcionLabel,
        descripcionPlaceholder,
        prioridadLabel,
        prioridades,
        prioridadInicial,
        tecnicoLabel,
        tecnicos,
        tecnicoInicial,
        confirmarLabel,
        resetOnConfirm,
        showDebug,
        backgroundColor,
        textColor,
        subtleBackgroundColor,
        borderColor,
        buttonColor,
        buttonTextColor,
        labelFont,
        inputFont,
        buttonFont,
        radius,
        padding,
        gap,
        onConfirm,
        backendError,
        style,
    } = props

    const safePrioridades = useMemo(() => {
        const arr = Array.isArray(prioridades)
            ? prioridades.filter(Boolean)
            : []
        return arr.length ? arr : ["Media"]
    }, [prioridades])

    const safeTecnicos = useMemo(() => {
        const arr = Array.isArray(tecnicos) ? tecnicos.filter(Boolean) : []
        return arr.length ? arr : ["Sin asignar"]
    }, [tecnicos])

    const initialPriority = useMemo(() => {
        if (prioridadInicial && safePrioridades.includes(prioridadInicial))
            return prioridadInicial
        return safePrioridades[0]
    }, [prioridadInicial, safePrioridades])

    const initialTech = useMemo(() => {
        if (tecnicoInicial && safeTecnicos.includes(tecnicoInicial))
            return tecnicoInicial
        return safeTecnicos[0]
    }, [tecnicoInicial, safeTecnicos])

    const [activo, setActivo] = useState<string>("")
    const [titulo, setTitulo] = useState<string>("")
    const [descripcion, setDescripcion] = useState<string>("")
    const [prioridad, setPrioridad] = useState<PriorityValue>(initialPriority)
    const [tecnico, setTecnico] = useState<string>(initialTech)
    const [lastPayload, setLastPayload] = useState<any>(null)

    const [openMenu, setOpenMenu] = useState<null | "prioridad" | "tecnico">(
        null
    )
    const prioridadWrapRef = useRef<HTMLDivElement>(null)
    const tecnicoWrapRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (openMenu === null) return
        if (typeof document === "undefined") return

        const handler = (e: MouseEvent) => {
            const target = e.target as Node | null
            const p = prioridadWrapRef.current
            const t = tecnicoWrapRef.current
            const isInside =
                (p && target && p.contains(target)) ||
                (t && target && t.contains(target))
            if (!isInside) startTransition(() => setOpenMenu(null))
        }

        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [openMenu])

    const fieldId = useMemo(() => {
        // Sufijo estable-ish por render, suficiente para evitar colisiones entre instancias
        return Math.random().toString(36).slice(2, 9)
    }, [])

    const inputBaseStyle: CSSProperties = useMemo(
        () => ({
            width: "100%",
            boxSizing: "border-box",
            border: `1px solid ${borderColor}`,
            background: subtleBackgroundColor,
            color: textColor,
            borderRadius: Math.max(0, radius - 2),
            padding: "10px 12px",
            outline: "none",
            ...inputFont,
        }),
        [borderColor, subtleBackgroundColor, textColor, radius, inputFont]
    )

    const labelStyle: CSSProperties = useMemo(
        () => ({
            display: "block",
            marginBottom: 6,
            color: textColor,
            ...labelFont,
        }),
        [textColor, labelFont]
    )

    const buttonStyle: CSSProperties = useMemo(
        () => ({
            width: "100%",
            border: "none",
            borderRadius: radius,
            padding: "12px 14px",
            background: buttonColor,
            color: buttonTextColor,
            cursor: "pointer",
            ...buttonFont,
        }),
        [radius, buttonColor, buttonTextColor, buttonFont]
    )

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault()

            const payload = {
                activo,
                titulo,
                descripcion,
                prioridad,
                tecnicoAsignado: tecnico,
                timestamp: new Date().toISOString(),
            }

            startTransition(() => setLastPayload(payload))

            if (typeof onConfirm === "function") onConfirm(payload)

            if (resetOnConfirm) {
                startTransition(() => {
                    setActivo("")
                    setTitulo("")
                    setDescripcion("")
                    setPrioridad(initialPriority)
                    setTecnico(initialTech)
                })
            }
        },
        [
            activo,
            titulo,
            descripcion,
            prioridad,
            tecnico,
            onConfirm,
            resetOnConfirm,
            initialPriority,
            initialTech,
        ]
    )

    const isThumbnail = false

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                padding,
                background: backgroundColor,
                color: textColor,
                borderRadius: radius,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap,
                ...style,
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    flex: 1,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap,
                    margin: 0,
                }}
                aria-label="Formulario de orden"
            >
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
                ) : null}
                <div style={{ width: "100%" }}>
                    <label htmlFor={`activo-${fieldId}`} style={labelStyle}>
                        {activoLabel}
                    </label>
                    {activos && activos.length > 0 ? (
                        <select
                            id={`activo-${fieldId}`}
                            value={activo}
                            onChange={(e) => startTransition(() => setActivo(e.target.value))}
                            style={{ ...inputBaseStyle, height: 42 }}
                            aria-label={activoLabel}
                        >
                            <option value="">Seleccioná un activo...</option>
                            {activos.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                    ) : (
                        <input
                            id={`activo-${fieldId}`}
                            type="text"
                            value={activo}
                            placeholder={activoPlaceholder}
                            onChange={(e) => startTransition(() => setActivo(e.target.value))}
                            style={inputBaseStyle}
                            aria-label={activoLabel}
                            autoComplete="off"
                            inputMode="text"
                        />
                    )}
                </div>

                <div style={{ width: "100%" }}>
                    <label htmlFor={`titulo-${fieldId}`} style={labelStyle}>
                        {tituloLabel}
                    </label>
                    <input
                        id={`titulo-${fieldId}`}
                        type="text"
                        value={titulo}
                        placeholder={tituloPlaceholder}
                        onChange={(e) =>
                            startTransition(() => setTitulo(e.target.value))
                        }
                        style={inputBaseStyle}
                        aria-label={tituloLabel}
                        autoComplete="off"
                    />
                </div>

                <div style={{ width: "100%" }}>
                    <label
                        htmlFor={`descripcion-${fieldId}`}
                        style={labelStyle}
                    >
                        {descripcionLabel}
                    </label>
                    <textarea
                        id={`descripcion-${fieldId}`}
                        value={descripcion}
                        placeholder={descripcionPlaceholder}
                        onChange={(e) =>
                            startTransition(() =>
                                setDescripcion(e.target.value)
                            )
                        }
                        style={{
                            ...inputBaseStyle,
                            resize: "vertical",
                            minHeight: 84,
                            lineHeight: inputFont?.lineHeight,
                        }}
                        aria-label={descripcionLabel}
                    />
                </div>

                <div
                    style={{
                        width: "100%",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap,
                    }}
                >
                    <div ref={prioridadWrapRef} style={{ width: "100%" }}>
                        <label
                            htmlFor={`prioridad-${fieldId}`}
                            style={labelStyle}
                        >
                            {prioridadLabel}
                        </label>
                        <button
                            id={`prioridad-${fieldId}`}
                            type="button"
                            onClick={() =>
                                startTransition(() =>
                                    setOpenMenu((v) =>
                                        v === "prioridad" ? null : "prioridad"
                                    )
                                )
                            }
                            style={{
                                ...inputBaseStyle,
                                textAlign: "left",
                                cursor: "pointer",
                            }}
                            aria-label={prioridadLabel}
                            aria-haspopup="listbox"
                            aria-expanded={openMenu === "prioridad"}
                        >
                            {String(prioridad)}
                        </button>
                        {openMenu === "prioridad" && (
                            <div
                                role="listbox"
                                aria-label={`${prioridadLabel} opciones`}
                                style={{
                                    marginTop: 6,
                                    border: `1px solid ${borderColor}`,
                                    background: backgroundColor,
                                    borderRadius: Math.max(0, radius - 2),
                                    overflow: "hidden",
                                    maxHeight: 180,
                                    overflowY: "auto",
                                }}
                            >
                                {safePrioridades.map((p) => {
                                    const selected = String(prioridad) === p
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() =>
                                                startTransition(() => {
                                                    setPrioridad(p)
                                                    setOpenMenu(null)
                                                })
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px",
                                                border: "none",
                                                background: selected
                                                    ? subtleBackgroundColor
                                                    : "transparent",
                                                color: textColor,
                                                textAlign: "left",
                                                cursor: "pointer",
                                                ...inputFont,
                                            }}
                                        >
                                            {p}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div ref={tecnicoWrapRef} style={{ width: "100%" }}>
                        <label
                            htmlFor={`tecnico-${fieldId}`}
                            style={labelStyle}
                        >
                            {tecnicoLabel}
                        </label>
                        <button
                            id={`tecnico-${fieldId}`}
                            type="button"
                            onClick={() =>
                                startTransition(() =>
                                    setOpenMenu((v) =>
                                        v === "tecnico" ? null : "tecnico"
                                    )
                                )
                            }
                            style={{
                                ...inputBaseStyle,
                                textAlign: "left",
                                cursor: "pointer",
                            }}
                            aria-label={tecnicoLabel}
                            aria-haspopup="listbox"
                            aria-expanded={openMenu === "tecnico"}
                        >
                            {tecnico}
                        </button>
                        {openMenu === "tecnico" && (
                            <div
                                role="listbox"
                                aria-label={`${tecnicoLabel} opciones`}
                                style={{
                                    marginTop: 6,
                                    border: `1px solid ${borderColor}`,
                                    background: backgroundColor,
                                    borderRadius: Math.max(0, radius - 2),
                                    overflow: "hidden",
                                    maxHeight: 180,
                                    overflowY: "auto",
                                }}
                            >
                                {safeTecnicos.map((t) => {
                                    const selected = tecnico === t
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() =>
                                                startTransition(() => {
                                                    setTecnico(t)
                                                    setOpenMenu(null)
                                                })
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px",
                                                border: "none",
                                                background: selected
                                                    ? subtleBackgroundColor
                                                    : "transparent",
                                                color: textColor,
                                                textAlign: "left",
                                                cursor: "pointer",
                                                ...inputFont,
                                            }}
                                        >
                                            {t}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    style={buttonStyle}
                    aria-label={confirmarLabel}
                >
                    {confirmarLabel}
                </button>

                {!isThumbnail && showDebug && (
                    <pre
                        style={{
                            margin: 0,
                            padding: "10px 12px",
                            borderRadius: Math.max(0, radius - 2),
                            border: `1px solid ${borderColor}`,
                            background: subtleBackgroundColor,
                            color: textColor,
                            overflow: "auto",
                            maxHeight: 140,
                            ...inputFont,
                            fontSize: inputFont?.fontSize || "12px",
                            lineHeight: inputFont?.lineHeight || "1.3em",
                        }}
                        aria-label="Salida de depuración"
                    >
                        {lastPayload
                            ? JSON.stringify(lastPayload, null, 2)
                            : "(Pulsa Confirmar para ver el payload)"}
                    </pre>
                )}
            </form>
        </div>
    )
}

