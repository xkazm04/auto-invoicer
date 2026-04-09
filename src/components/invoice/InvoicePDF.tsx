import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Invoice } from "@/types/invoice";
import { computeInvoiceTotals, computeLineItemAmount } from "@/types/invoice";
import type { ThemeId } from "./theme";
import { getPdfTheme, type PdfTheme } from "@/lib/pdf/pdfTheme";

function buildStyles(t: PdfTheme) {
  const c = t.colors;
  return StyleSheet.create({
    page: {
      paddingTop: 48,
      paddingBottom: 48,
      paddingHorizontal: 48,
      fontSize: 10,
      color: c.text,
      backgroundColor: c.background,
      fontFamily: t.fontFamily,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 32,
      paddingBottom: 16,
      borderBottom: `1pt solid ${c.border}`,
    },
    headerLabel: {
      fontSize: 8,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: c.textMuted,
      marginBottom: 4,
    },
    headerNumber: {
      fontSize: 24,
      fontWeight: "light",
      color: c.text,
    },
    status: {
      fontSize: 9,
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    datesRow: {
      flexDirection: "row",
      marginBottom: 28,
    },
    dateCell: {
      flex: 1,
      paddingRight: 12,
    },
    dateLabel: {
      fontSize: 7,
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
    },
    dateValue: {
      fontSize: 11,
      color: c.text,
    },
    partiesRow: {
      flexDirection: "row",
      marginBottom: 28,
    },
    partyCard: {
      flex: 1,
      padding: t.panelPadding,
      backgroundColor: c.panel,
      borderRadius: t.borderRadius,
    },
    partyCardSpacer: {
      width: 12,
    },
    partyHeader: {
      fontSize: 7,
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    partyName: {
      fontSize: 12,
      fontWeight: "bold",
      color: c.text,
      marginBottom: 6,
    },
    partyDetailRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    partyDetailLabel: {
      fontSize: 7,
      color: c.textFaint,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      width: 40,
    },
    partyDetailValue: {
      fontSize: 9,
      color: c.text,
      flex: 1,
    },
    partyAddress: {
      fontSize: 9,
      color: c.text,
      marginTop: 6,
      lineHeight: 1.4,
    },
    itemsHeader: {
      fontSize: 7,
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    table: {
      borderTop: `1pt solid ${c.borderStrong}`,
      borderBottom: `1pt solid ${c.border}`,
      marginBottom: 24,
    },
    tableHeaderRow: {
      flexDirection: "row",
      paddingVertical: 8,
      borderBottom: `0.5pt solid ${c.border}`,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      borderBottom: `0.5pt solid ${c.border}`,
    },
    tableRowLast: {
      flexDirection: "row",
      paddingVertical: 8,
    },
    colDescription: {
      flex: 5,
      fontSize: 10,
    },
    colQty: {
      flex: 1.5,
      fontSize: 10,
      textAlign: "center",
    },
    colPrice: {
      flex: 2,
      fontSize: 10,
      textAlign: "right",
    },
    colAmount: {
      flex: 2,
      fontSize: 10,
      textAlign: "right",
      fontWeight: "bold",
    },
    thText: {
      fontSize: 7,
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
      fontWeight: "bold",
    },
    totalsWrap: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    totalsBox: {
      width: 220,
    },
    totalsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    totalsLabel: {
      fontSize: 9,
      color: c.textMuted,
    },
    totalsValue: {
      fontSize: 9,
      color: c.text,
    },
    totalsDivider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: 6,
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      paddingTop: 4,
    },
    grandTotalLabel: {
      fontSize: 10,
      color: c.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    grandTotalValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: c.text,
    },
    grandTotalCurrency: {
      fontSize: 10,
      color: c.textMuted,
      marginLeft: 4,
    },
  });
}

function formatMoney(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatTotal(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export interface InvoicePDFProps {
  invoice: Invoice;
  themeId?: ThemeId;
}

export function InvoicePDF({ invoice, themeId = "paper-perfect" }: InvoicePDFProps) {
  const pdfTheme = getPdfTheme(themeId);
  const styles = buildStyles(pdfTheme);
  const totals = computeInvoiceTotals(invoice);
  const items = invoice.lineItems;

  return (
    <Document
      title={`Invoice ${invoice.number}`}
      author={invoice.supplier.name || undefined}
      subject={`Invoice ${invoice.number}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Invoice</Text>
            <Text style={styles.headerNumber}>#{invoice.number}</Text>
          </View>
          <Text style={styles.status}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Text>
        </View>

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateCell}>
            <Text style={styles.dateLabel}>Issue Date</Text>
            <Text style={styles.dateValue}>{invoice.issueDate || "—"}</Text>
          </View>
          <View style={styles.dateCell}>
            <Text style={styles.dateLabel}>Due Date</Text>
            <Text style={styles.dateValue}>{invoice.dueDate || "—"}</Text>
          </View>
          <View style={styles.dateCell}>
            <Text style={styles.dateLabel}>Tax Point</Text>
            <Text style={styles.dateValue}>{invoice.taxPoint || "—"}</Text>
          </View>
          <View style={styles.dateCell}>
            <Text style={styles.dateLabel}>Currency</Text>
            <Text style={styles.dateValue}>{invoice.currency}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesRow}>
          <View style={styles.partyCard}>
            <Text style={styles.partyHeader}>From — Supplier</Text>
            <Text style={styles.partyName}>{invoice.supplier.name || "—"}</Text>
            <View style={styles.partyDetailRow}>
              <Text style={styles.partyDetailLabel}>Tax ID</Text>
              <Text style={styles.partyDetailValue}>{invoice.supplier.taxId || "—"}</Text>
            </View>
            <View style={styles.partyDetailRow}>
              <Text style={styles.partyDetailLabel}>VAT ID</Text>
              <Text style={styles.partyDetailValue}>{invoice.supplier.vatId || "—"}</Text>
            </View>
            {invoice.supplier.registrationId ? (
              <View style={styles.partyDetailRow}>
                <Text style={styles.partyDetailLabel}>Reg. #</Text>
                <Text style={styles.partyDetailValue}>{invoice.supplier.registrationId}</Text>
              </View>
            ) : null}
            {invoice.supplier.address ? (
              <Text style={styles.partyAddress}>{invoice.supplier.address}</Text>
            ) : null}
          </View>
          <View style={styles.partyCardSpacer} />
          <View style={styles.partyCard}>
            <Text style={styles.partyHeader}>To — Customer</Text>
            <Text style={styles.partyName}>{invoice.customer.name || "—"}</Text>
            <View style={styles.partyDetailRow}>
              <Text style={styles.partyDetailLabel}>Tax ID</Text>
              <Text style={styles.partyDetailValue}>{invoice.customer.taxId || "—"}</Text>
            </View>
            <View style={styles.partyDetailRow}>
              <Text style={styles.partyDetailLabel}>VAT ID</Text>
              <Text style={styles.partyDetailValue}>{invoice.customer.vatId || "—"}</Text>
            </View>
            {invoice.customer.registrationId ? (
              <View style={styles.partyDetailRow}>
                <Text style={styles.partyDetailLabel}>Reg. #</Text>
                <Text style={styles.partyDetailValue}>{invoice.customer.registrationId}</Text>
              </View>
            ) : null}
            {invoice.customer.address ? (
              <Text style={styles.partyAddress}>{invoice.customer.address}</Text>
            ) : null}
          </View>
        </View>

        {/* Line items */}
        <Text style={styles.itemsHeader}>Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDescription, styles.thText]}>Description</Text>
            <Text style={[styles.colQty, styles.thText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.thText]}>Price</Text>
            <Text style={[styles.colAmount, styles.thText]}>Amount</Text>
          </View>
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <View key={item.id} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={styles.colDescription}>{item.description || "—"}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>{formatMoney(item.unitPrice)}</Text>
                <Text style={styles.colAmount}>
                  {formatMoney(computeLineItemAmount(item))}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatMoney(totals.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                VAT {Math.round(invoice.vatRate * 100)}%
              </Text>
              <Text style={styles.totalsValue}>{formatMoney(totals.vat)}</Text>
            </View>
            <View style={styles.totalsDivider} />
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={styles.grandTotalValue}>{formatTotal(totals.total)}</Text>
                <Text style={styles.grandTotalCurrency}>{invoice.currency}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* Payment Details */}
        {(invoice.paymentDetails.iban || invoice.paymentDetails.bankName) && (
          <View style={{ marginTop: 28 }}>
            <Text style={styles.itemsHeader}>Payment Details</Text>
            <View style={styles.partyCard}>
              {invoice.paymentDetails.iban && (
                <View style={styles.partyDetailRow}>
                  <Text style={[styles.partyDetailLabel, { width: 50 }]}>IBAN</Text>
                  <Text style={[styles.partyDetailValue, { fontFamily: "Courier" }]}>
                    {invoice.paymentDetails.iban}
                  </Text>
                </View>
              )}
              {invoice.paymentDetails.swift && (
                <View style={styles.partyDetailRow}>
                  <Text style={[styles.partyDetailLabel, { width: 50 }]}>SWIFT</Text>
                  <Text style={[styles.partyDetailValue, { fontFamily: "Courier" }]}>
                    {invoice.paymentDetails.swift}
                  </Text>
                </View>
              )}
              {invoice.paymentDetails.bankName && (
                <View style={styles.partyDetailRow}>
                  <Text style={[styles.partyDetailLabel, { width: 50 }]}>Bank</Text>
                  <Text style={styles.partyDetailValue}>{invoice.paymentDetails.bankName}</Text>
                </View>
              )}
              {invoice.paymentDetails.reference && (
                <View style={styles.partyDetailRow}>
                  <Text style={[styles.partyDetailLabel, { width: 50 }]}>Ref.</Text>
                  <Text style={[styles.partyDetailValue, { fontFamily: "Courier" }]}>
                    {invoice.paymentDetails.reference}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
