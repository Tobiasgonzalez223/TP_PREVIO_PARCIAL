import type { CSSProperties } from "react"

type ColumnField = "col1" | "col2" | "col3" | "col4" | "col5" | "col6"

type Align = "left" | "center" | "right"

interface ColumnConfig {
    field: ColumnField
    title: string
    align: Align
    width: number
}

interface RowData {
    col1: string
    col2: string
    col3: string
    col4: string
    col5: string
    col6: string
}

interface TablaOrdenesProps {
    columns: ColumnConfig[]
    rows: RowData[]

    showHeader: boolean
    striped: boolean

    backgroundColor: string
    headerBackground: string
    borderColor: string
    textColor: string
    headerTextColor: string

    paddingX: number
    paddingY: number
    borderRadius: number
    borderWidth: number

    font: any
    headerFont: any

    style?: CSSProperties
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}

/**
 * TablaOrdenes
 *
 * @framerIntrinsicWidth 700
 * @framerIntrinsicHeight 320
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function TablaOrdenes(props: TablaOrdenesProps) {
    const {
        columns = [
            { field: "col1", title: "Orden", align: "left", width: 160 },
            { field: "col2", title: "Cliente", align: "left", width: 220 },
            { field: "col3", title: "Estado", align: "center", width: 140 },
            { field: "col4", title: "Total", align: "right", width: 120 },
        ],
        rows = [
            {
                col1: "#1001",
                col2: "Acme S.A.",
                col3: "Pagado",
                col4: "$ 249.00",
                col5: "",
                col6: "",
            },
            {
                col1: "#1002",
                col2: "Globex",
                col3: "Pendiente",
                col4: "$ 89.00",
                col5: "",
                col6: "",
            },
            {
                col1: "#1003",
                col2: "Initech",
                col3: "Enviado",
                col4: "$ 1,120.00",
                col5: "",
                col6: "",
            },
        ],

        showHeader = true,
        striped = true,

        backgroundColor = "#FFFFFF",
        headerBackground = "#F5F5F5",
        borderColor = "#EEEEEE",
        textColor = "#000000",
        headerTextColor = "#000000",

        paddingX = 14,
        paddingY = 10,
        borderRadius = 12,
        borderWidth = 1,

        font,
        headerFont,
        style,
    } = props

    const safeBorderWidth = clamp(borderWidth, 0, 8)

    const normalizedColumns = (Array.isArray(columns) ? columns : [])
        .filter(Boolean)
        .slice(0, 6)
    const normalizedRows = (Array.isArray(rows) ? rows : []).filter(Boolean)

    return (
        <div
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: backgroundColor,
                borderRadius,
                border:
                    safeBorderWidth > 0
                        ? `${safeBorderWidth}px solid ${borderColor}`
                        : "none",
                color: textColor,
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "auto",
                    WebkitOverflowScrolling: "touch",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        tableLayout: "fixed",
                        ...font,
                    }}
                    role="table"
                    aria-label="Tabla de órdenes"
                >
                    <colgroup>
                        {normalizedColumns.map((c, idx) => (
                            <col
                                key={`${c.field}-${idx}`}
                                style={{
                                    width:
                                        c.width > 0 ? `${c.width}px` : "auto",
                                }}
                            />
                        ))}
                    </colgroup>

                    {showHeader && (
                        <thead>
                            <tr>
                                {normalizedColumns.map((c, idx) => (
                                    <th
                                        key={`${c.field}-${idx}`}
                                        scope="col"
                                        style={{
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 1,
                                            background: headerBackground,
                                            color: headerTextColor,
                                            textAlign: c.align,
                                            padding: `${paddingY}px ${paddingX}px`,
                                            borderBottom: `1px solid ${borderColor}`,
                                            ...headerFont,
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "block",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {c.title}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}

                    <tbody>
                        {normalizedRows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={Math.max(
                                        1,
                                        normalizedColumns.length
                                    )}
                                    style={{
                                        padding: `${paddingY}px ${paddingX}px`,
                                        color: textColor,
                                        opacity: 0.6,
                                        borderBottom: `1px solid ${borderColor}`,
                                    }}
                                >
                                    Sin datos
                                </td>
                            </tr>
                        ) : (
                            normalizedRows.map((row, rowIndex) => {
                                const rowBg =
                                    striped && rowIndex % 2 === 1
                                        ? "rgba(0,0,0,0.03)"
                                        : "transparent"

                                return (
                                    <tr
                                        key={`row-${rowIndex}`}
                                        style={{ background: rowBg }}
                                    >
                                        {normalizedColumns.map(
                                            (c, colIndex) => {
                                                const value =
                                                    (row as any)?.[c.field] ??
                                                    ""

                                                return (
                                                    <td
                                                        key={`${c.field}-${rowIndex}-${colIndex}`}
                                                        style={{
                                                            padding: `${paddingY}px ${paddingX}px`,
                                                            textAlign: c.align,
                                                            verticalAlign:
                                                                "middle",
                                                            borderBottom: `1px solid ${borderColor}`,
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display:
                                                                    "block",
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                        >
                                                            {String(value)}
                                                        </span>
                                                    </td>
                                                )
                                            }
                                        )}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Framer metadata removed — not used in this project