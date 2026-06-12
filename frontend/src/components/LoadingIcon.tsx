import { motion, useInView } from "framer-motion"
import React, { useMemo, useRef } from "react"
import type { CSSProperties } from "react"

type LoadingIconProps = {
    visible?: boolean
    label?: string
    showLabel?: boolean
    size?: number
    strokeWidth?: number
    color?: string
    trackColor?: string
    font?: any
    style?: CSSProperties
}

/**
 * ErrorMessage
 *
 * @framerIntrinsicWidth 120
 * @framerIntrinsicHeight 120
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function LoadingIcon(props: LoadingIconProps) {
    const {
        visible = true,
        label = "Cargando…",
        showLabel = false,
        size = 42,
        strokeWidth = 4,
        color = "#000000",
        trackColor = "#EEEEEE",
        font,
        style,
    } = props

    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { margin: "200px" })

    if (!visible) return null

    const radius = useMemo(() => {
        const r = (size - strokeWidth) / 2
        return Math.max(2, r)
    }, [size, strokeWidth])

    const circumference = useMemo(() => 2 * Math.PI * radius, [radius])
    const dash = useMemo(() => circumference * 0.25, [circumference])

    return (
        <div
            ref={ref}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 10,
                boxSizing: "border-box",
            }}
            aria-busy="true"
            role="status"
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ display: "block" }}
                aria-hidden="true"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {!inView ? (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${circumference}`}
                    />
                ) : (
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${circumference}`}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1.0,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{ transformOrigin: "50% 50%" }}
                    />
                )}
            </svg>

            {showLabel && (
                <div style={{ ...font, color, width: "max-content" }}>
                    {label}
                </div>
            )}
        </div>
    )
}
