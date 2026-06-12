import type { CSSProperties } from "react"
import { startTransition, useMemo, useState } from "react"

type Rol = "admin" | "agente" | "supervisor" | "invitado"

type Direction = "horizontal" | "vertical"

type ButtonVariant = "solid" | "outline"

interface AccionesPorRolProps {
    rol: Rol

    usarPermisosPorRol: boolean
    permitirAsignar: boolean
    permitirCancelar: boolean
    permitirResolver: boolean

    mostrarAsignar: boolean
    mostrarCancelar: boolean
    mostrarResolver: boolean

    labelAsignar: string
    labelCancelar: string
    labelResolver: string

    layout: Direction
    gap: number

    buttonVariant: ButtonVariant
    buttonRadius: number
    buttonPaddingV: number
    buttonPaddingH: number

    colorAsignar: string
    colorCancelar: string
    colorResolver: string
    textOnSolid: string
    textOnOutline: string
    borderColorOutline: string

    font: any

    onAsignar: () => void
    onCancelar: () => void
    onResolver: () => void

    style?: CSSProperties
}

function permisosPorRol(rol: Rol) {
    switch (rol) {
        case "admin":
            return {
                permitirAsignar: true,
                permitirCancelar: true,
                permitirResolver: true,
            }
        case "supervisor":
            return {
                permitirAsignar: true,
                permitirCancelar: true,
                permitirResolver: true,
            }
        case "agente":
            return {
                permitirAsignar: true,
                permitirCancelar: true,
                permitirResolver: true,
            }
        case "invitado":
        default:
            return {
                permitirAsignar: false,
                permitirCancelar: false,
                permitirResolver: false,
            }
    }
}

/**
 * AccionesPorRol
 *
 * @framerIntrinsicWidth 420
 * @framerIntrinsicHeight 56
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function AccionesPorRol(props: AccionesPorRolProps) {
    const {
        rol,
        usarPermisosPorRol,
        permitirAsignar,
        permitirCancelar,
        permitirResolver,
        mostrarAsignar,
        mostrarCancelar,
        mostrarResolver,
        labelAsignar,
        labelCancelar,
        labelResolver,
        layout,
        gap,
        buttonVariant,
        buttonRadius,
        buttonPaddingV,
        buttonPaddingH,
        colorAsignar,
        colorCancelar,
        colorResolver,
        textOnSolid,
        textOnOutline,
        borderColorOutline,
        font,
        onAsignar,
        onCancelar,
        onResolver,
        style,
    } = props

    const permisos = useMemo(() => {
        if (usarPermisosPorRol) return permisosPorRol(rol)
        return { permitirAsignar, permitirCancelar, permitirResolver }
    }, [
        rol,
        usarPermisosPorRol,
        permitirAsignar,
        permitirCancelar,
        permitirResolver,
    ])

    const [hovered, setHovered] = useState<
        null | "asignar" | "cancelar" | "resolver"
    >(null)

    const isHorizontal = layout === "horizontal"

    const baseButtonStyle = useMemo((): CSSProperties => {
        return {
            appearance: "none",
            WebkitAppearance: "none",
            borderRadius: buttonRadius,
            border:
                buttonVariant === "outline"
                    ? `1px solid ${borderColorOutline}`
                    : "1px solid transparent",
            padding: `${buttonPaddingV}px ${buttonPaddingH}px`,
            cursor: "pointer",
            outline: "none",
            background: buttonVariant === "outline" ? "transparent" : "#000",
            color: buttonVariant === "outline" ? textOnOutline : textOnSolid,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            userSelect: "none",
            whiteSpace: "nowrap",
            flex: isHorizontal ? "0 0 auto" : undefined,
            width: isHorizontal ? undefined : "100%",
            ...font,
        }
    }, [
        buttonRadius,
        buttonVariant,
        buttonPaddingV,
        buttonPaddingH,
        borderColorOutline,
        textOnOutline,
        textOnSolid,
        font,
        isHorizontal,
    ])

    const actions = useMemo(() => {
        const items: Array<{
            key: "asignar" | "cancelar" | "resolver"
            label: string
            allowed: boolean
            visible: boolean
            color: string
            onAction: () => void
        }> = [
            {
                key: "asignar",
                label: labelAsignar,
                allowed: permisos.permitirAsignar,
                visible: mostrarAsignar,
                color: colorAsignar,
                onAction: onAsignar,
            },
            {
                key: "cancelar",
                label: labelCancelar,
                allowed: permisos.permitirCancelar,
                visible: mostrarCancelar,
                color: colorCancelar,
                onAction: onCancelar,
            },
            {
                key: "resolver",
                label: labelResolver,
                allowed: permisos.permitirResolver,
                visible: mostrarResolver,
                color: colorResolver,
                onAction: onResolver,
            },
        ]

        return items.filter((a) => a.visible && a.allowed)
    }, [
        labelAsignar,
        labelCancelar,
        labelResolver,
        permisos.permitirAsignar,
        permisos.permitirCancelar,
        permisos.permitirResolver,
        mostrarAsignar,
        mostrarCancelar,
        mostrarResolver,
        colorAsignar,
        colorCancelar,
        colorResolver,
        onAsignar,
        onCancelar,
        onResolver,
    ])

    const empty = actions.length === 0

    const isFixedWidth = !!(style && style.width === "100%")

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "auto",
                display: "flex",
                flexDirection: isHorizontal ? "row" : "column",
                alignItems: isHorizontal ? "center" : "stretch",
                justifyContent: "flex-start",
                gap,
                ...(isFixedWidth ? {} : { minWidth: "max-content" }),
                ...style,
            }}
            aria-label={`Acciones disponibles para rol: ${rol}`}
        >
            {empty ? (
                <span
                    style={{
                        ...font,
                        color: "rgba(0,0,0,0.45)",
                        width: "max-content",
                        userSelect: "none",
                    }}
                >
                    Sin acciones disponibles
                </span>
            ) : (
                actions.map((a) => {
                    const isHovered = hovered === a.key
                    const background =
                        buttonVariant === "outline" ? "transparent" : a.color
                    const color =
                        buttonVariant === "outline" ? a.color : textOnSolid
                    const border =
                        buttonVariant === "outline"
                            ? `1px solid ${a.color}`
                            : "1px solid transparent"

                    return (
                        <button
                            key={a.key}
                            type="button"
                            style={{
                                ...baseButtonStyle,
                                background,
                                color,
                                border,
                                opacity: isHovered ? 0.92 : 1,
                            }}
                            onClick={() => {
                                // Mantener patrón seguro de transiciones aunque no haya estado local aquí
                                startTransition(() => {
                                    a.onAction?.()
                                })
                            }}
                            onMouseEnter={() => {
                                startTransition(() => setHovered(a.key))
                            }}
                            onMouseLeave={() => {
                                startTransition(() => setHovered(null))
                            }}
                            role="button"
                            aria-label={a.label}
                        >
                            {a.label}
                        </button>
                    )
                })
            )}
        </div>
    )
}

// Framer metadata removed — not used in this project
