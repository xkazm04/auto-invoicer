# InvoiceFlow - Solution Design Document

> **Version**: 1.0.0  
> **Last Updated**: December 2024  
> **Architecture**: NextJS 14 + Supabase + Groq + React-PDF + RevenueCat

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [Internationalization (i18n)](#5-internationalization-i18n)
6. [Country-Specific Invoice Requirements](#6-country-specific-invoice-requirements)
7. [LLM Integration (Groq)](#7-llm-integration-groq)
8. [PDF Generation (React-PDF)](#8-pdf-generation-react-pdf)
9. [RevenueCat Paywall Integration](#9-revenuecat-paywall-integration)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Automation Features](#11-automation-features)
12. [API Design](#12-api-design)
13. [Security & Compliance](#13-security--compliance)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)

---

## 1. Executive Summary

### Vision

InvoiceFlow is a next-generation invoice management platform designed for minimal user effort and maximum automation. The system leverages AI to extract invoice data, auto-fill forms, and predict user needs while maintaining compliance with international invoicing standards.

### Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Zero-friction** | AI auto-extraction, smart defaults, one-click actions |
| **Minimal UI** | Compact, information-dense layouts with progressive disclosure |
| **Global-first** | Multi-country support from day one |
| **Offline-capable** | PWA with local caching |
| **Cost-efficient** | Free tier viable, predictable scaling costs |

### Target Users

- **Self-employed individuals** (OSVČ in CZ, Freelancers in DE, Sole Traders in UK)
- **Micro-businesses** (1-10 employees)
- **Accountants** managing multiple clients

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    NextJS 14 App Router (PWA)                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │Dashboard │ │ Inbox    │ │ Editor   │ │ Contacts │ │ Settings │  │   │
│  │  │ Widget   │ │ (Scan)   │ │ (Create) │ │ (CRM)    │ │ (i18n)   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                              API LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    NextJS API Routes + tRPC                          │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐  │   │
│  │  │ /api/ocr     │ │ /api/invoice │ │ /api/export  │ │ /api/sub   │  │   │
│  │  │ Groq Vision  │ │ CRUD + Rules │ │ PDF/CSV/XML  │ │ RevenueCat │  │   │
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘  │   │
│  └─────────┼────────────────┼────────────────┼───────────────┼──────────┘   │
└────────────┼────────────────┼────────────────┼───────────────┼──────────────┘
             │                │                │               │
┌────────────▼────────────────▼────────────────▼───────────────▼──────────────┐
│                           SERVICE LAYER                                     │
│  ┌─────────────┐  ┌─────────────────────────────────────┐  ┌─────────────┐  │
│  │   Groq AI   │  │            Supabase                 │  │ RevenueCat  │  │
│  │  ┌───────┐  │  │  ┌──────────┐ ┌────────┐ ┌───────┐  │  │  ┌───────┐  │  │
│  │  │LLaVA  │  │  │  │PostgreSQL│ │Storage │ │ Auth  │  │  │  │ Subs  │  │  │
│  │  │Mixtral│  │  │  │ + RLS    │ │(S3)    │ │(OAuth)│  │  │  │ Plans │  │  │
│  │  └───────┘  │  │  └──────────┘ └────────┘ └───────┘  │  │  └───────┘  │  │
│  └─────────────┘  └─────────────────────────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Invoice OCR Processing

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Upload  │───▶│ Storage │───▶│  Groq   │───▶│ Validate│───▶│  Save   │
│ Image   │    │ Bucket  │    │  OCR    │    │ + Enrich│    │   DB    │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
     │                             │               │
     │                             ▼               ▼
     │                      ┌─────────────────────────┐
     │                      │  Country Validator      │
     │                      │  • CZ: ARES API (IČO)   │
     │                      │  • DE: Handelsregister  │
     │                      │  • UK: Companies House  │
     │                      └─────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│              Real-time UI Update                    │
│  • Skeleton → Confidence bars → Final data          │
│  • Inline corrections with learning                 │
└─────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Core Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | NextJS 14 (App Router) | RSC, streaming, edge runtime |
| **Database** | Supabase (PostgreSQL) | RLS, realtime, generous free tier |
| **Auth** | Supabase Auth | OAuth, magic links, MFA |
| **Storage** | Supabase Storage | S3-compatible, CDN |
| **AI/LLM** | Groq (Mixtral/LLaVA) | Fast inference, cost-effective |
| **PDF** | React-PDF/renderer | React-native PDF generation |
| **Payments** | RevenueCat | Cross-platform subscription management |
| **i18n** | next-intl | Type-safe, RSC-compatible |
| **Styling** | Tailwind CSS + Radix UI | Utility-first, accessible primitives |
| **State** | Zustand + TanStack Query | Minimal boilerplate, caching |
| **Validation** | Zod | Runtime type validation |

### Package Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "groq-sdk": "^0.5.0",
    "@react-pdf/renderer": "^3.4.0",
    "purchases-js": "^0.10.0",
    "next-intl": "^3.20.0",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.50.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.400.0",
    "date-fns": "^3.6.0",
    "react-dropzone": "^14.2.0",
    "framer-motion": "^11.3.0"
  }
}
```

---

## 4. Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   users         │       │  organizations  │       │   team_members  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──┐   │ id (PK)         │◄──────│ id (PK)         │
│ email           │   │   │ owner_id (FK)───┼───────│ org_id (FK)     │
│ full_name       │   │   │ name            │       │ user_id (FK)────┼───┐
│ avatar_url      │   │   │ country_code    │       │ role            │   │
│ locale          │   │   │ tax_id          │       │ invited_at      │   │
│ created_at      │   │   │ vat_id          │       └─────────────────┘   │
└─────────────────┘   │   │ entity_type     │                             │
                      │   │ settings (JSONB)│       ┌─────────────────┐   │
                      │   │ created_at      │       │  subscriptions  │   │
                      │   └─────────────────┘       ├─────────────────┤   │
                      │           │                 │ id (PK)         │   │
                      │           │                 │ user_id (FK)────┼───┘
                      │           ▼                 │ rc_customer_id  │
                      │   ┌─────────────────┐       │ plan_id         │
                      │   │    contacts     │       │ status          │
                      │   ├─────────────────┤       │ current_period  │
                      │   │ id (PK)         │       │ entitlements    │
                      │   │ org_id (FK)     │       └─────────────────┘
                      │   │ type (enum)     │
                      │   │ name            │       ┌─────────────────┐
                      │   │ country_code    │       │country_configs  │
                      │   │ tax_id          │       ├─────────────────┤
                      │   │ vat_id          │       │ code (PK)       │
                      │   │ address (JSONB) │       │ name            │
                      │   │ bank (JSONB)    │       │ currency        │
                      │   │ defaults (JSONB)│       │ vat_rates       │
                      │   │ created_at      │       │ invoice_rules   │
                      │   └─────────────────┘       │ tax_id_format   │
                      │           ▲                 │ date_format     │
                      │           │                 │ number_format   │
                      │           │                 └─────────────────┘
                      │   ┌───────┴───────┐
                      │   │               │
┌─────────────────┐   │   │               │         ┌─────────────────┐
│    invoices     │   │   │               │         │  invoice_items  │
├─────────────────┤   │   │               │         ├─────────────────┤
│ id (PK)         │───┼───┘               │         │ id (PK)         │
│ org_id (FK)     │   │                   │         │ invoice_id (FK) │◄──┐
│ contact_id (FK)─┼───┘                   │         │ description     │   │
│ created_by (FK)─┼───────────────────────┘         │ quantity        │   │
│ type (enum)     │                                 │ unit            │   │
│ status (enum)   │                                 │ unit_price      │   │
│ number          │                                 │ vat_rate        │   │
│ variable_symbol │                                 │ discount        │   │
│ issue_date      │                                 │ total           │   │
│ tax_date        │                                 │ sort_order      │   │
│ due_date        │                                 └─────────────────┘   │
│ currency        │                                                       │
│ subtotal        │                                 ┌─────────────────┐   │
│ vat_breakdown   │                                 │   attachments   │   │
│ total           │                                 ├─────────────────┤   │
│ notes           │                                 │ id (PK)         │   │
│ payment_info    │                                 │ invoice_id (FK) │   │
│ country_data    │─────────────────────────────────│ file_path       │   │
│ pdf_path        │                                 │ file_type       │   │
│ source          │                                 │ ocr_data (JSONB)│   │
│ metadata (JSONB)│                                 │ created_at      │   │
│ created_at      │─────────────────────────────────┴─────────────────┘   │
│ updated_at      │                                                       │
└─────────────────┴───────────────────────────────────────────────────────┘
```

### SQL Schema Definition

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy search

-- ENUM Types
CREATE TYPE entity_type AS ENUM ('self_employed', 'company', 'non_profit');
CREATE TYPE invoice_type AS ENUM ('issued', 'received', 'proforma', 'credit_note');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE contact_type AS ENUM ('customer', 'supplier', 'both');
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'accountant', 'viewer');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled', 'trial');

-- Country configurations (seed data)
CREATE TABLE country_configs (
    code VARCHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    currency VARCHAR(3) NOT NULL,
    currency_symbol VARCHAR(5),
    vat_rates JSONB NOT NULL DEFAULT '[]',
    -- Example: [{"rate": 21, "name": "standard"}, {"rate": 12, "name": "reduced"}, {"rate": 0, "name": "zero"}]
    invoice_rules JSONB NOT NULL DEFAULT '{}',
    -- Country-specific required fields, formats, validations
    tax_id_label VARCHAR(50),  -- "IČO", "Steuernummer", "Company Number"
    tax_id_format VARCHAR(100),  -- Regex pattern
    vat_id_prefix VARCHAR(5),  -- "CZ", "DE", "GB"
    vat_id_format VARCHAR(100),
    date_format VARCHAR(20) DEFAULT 'dd.MM.yyyy',
    number_format JSONB DEFAULT '{"decimal": ",", "thousand": " "}',
    payment_methods JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    locale VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (business entities)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL REFERENCES country_configs(code),
    entity_type entity_type NOT NULL,
    
    -- Tax identifiers (country-specific)
    tax_id VARCHAR(50),  -- IČO, Company Number, etc.
    vat_id VARCHAR(50),  -- DIČ, VAT Number, USt-IdNr.
    is_vat_payer BOOLEAN DEFAULT FALSE,
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    region VARCHAR(100),
    
    -- Banking
    bank_accounts JSONB DEFAULT '[]',
    -- Example: [{"iban": "CZ...", "bic": "...", "name": "Primary", "default": true}]
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#0066FF',
    
    -- Invoice settings
    invoice_prefix VARCHAR(10) DEFAULT 'INV',
    invoice_counter INTEGER DEFAULT 1,
    default_due_days INTEGER DEFAULT 14,
    default_currency VARCHAR(3),
    default_language VARCHAR(10),
    invoice_footer TEXT,
    
    -- Country-specific settings stored as JSONB
    country_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    role team_role NOT NULL DEFAULT 'viewer',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    
    UNIQUE(org_id, email)
);

-- Contacts (customers/suppliers)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type contact_type NOT NULL DEFAULT 'customer',
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Location
    country_code VARCHAR(2) REFERENCES country_configs(code),
    address JSONB DEFAULT '{}',
    
    -- Tax info
    tax_id VARCHAR(50),
    vat_id VARCHAR(50),
    is_vat_payer BOOLEAN DEFAULT FALSE,
    
    -- Banking
    bank_info JSONB DEFAULT '{}',
    
    -- Defaults for new invoices
    defaults JSONB DEFAULT '{}',
    -- Example: {"due_days": 30, "currency": "EUR", "language": "de"}
    
    -- Metadata
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    
    -- Type and status
    type invoice_type NOT NULL DEFAULT 'issued',
    status invoice_status NOT NULL DEFAULT 'draft',
    
    -- Identifiers
    number VARCHAR(50) NOT NULL,
    variable_symbol VARCHAR(20),  -- Payment reference (CZ specific, but useful elsewhere)
    
    -- Dates
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tax_date DATE,  -- DUZP in CZ
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Currency
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    exchange_rate DECIMAL(10, 6) DEFAULT 1.0,
    
    -- Amounts
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount_total DECIMAL(15, 2) DEFAULT 0,
    vat_breakdown JSONB DEFAULT '[]',
    -- Example: [{"rate": 21, "base": 1000, "amount": 210}]
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_info JSONB DEFAULT '{}',
    -- Example: {"iban": "...", "variable_symbol": "...", "qr_code": "..."}
    
    -- Content
    notes TEXT,
    internal_notes TEXT,
    
    -- Country-specific data
    country_data JSONB DEFAULT '{}',
    -- Stores any country-specific fields dynamically
    
    -- Files
    pdf_path TEXT,
    
    -- OCR source tracking
    source VARCHAR(20) DEFAULT 'manual',  -- 'manual', 'ocr', 'import', 'api'
    source_file_id UUID,
    ocr_confidence DECIMAL(5, 2),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(org_id, number)
);

-- Invoice items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    description TEXT NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'ks',  -- pcs, hrs, etc.
    unit_price DECIMAL(15, 4) NOT NULL,
    
    vat_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    
    subtotal DECIMAL(15, 2) NOT NULL,
    vat_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments (uploaded files, OCR sources)
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    
    -- OCR processing
    ocr_status VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, failed
    ocr_data JSONB,  -- Extracted data from LLM
    ocr_processed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (RevenueCat sync)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- RevenueCat identifiers
    rc_customer_id VARCHAR(255) NOT NULL UNIQUE,
    rc_subscription_id VARCHAR(255),
    
    -- Plan info
    plan_id VARCHAR(50) NOT NULL,  -- 'free', 'starter', 'professional', 'business'
    status subscription_status NOT NULL DEFAULT 'active',
    
    -- Period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Entitlements cache
    entitlements JSONB DEFAULT '{}',
    -- Example: {"invoices_per_month": 50, "ocr_scans": 100, "team_members": 5}
    
    -- Usage tracking
    usage_this_period JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice templates
CREATE TABLE invoice_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Template design
    layout VARCHAR(20) DEFAULT 'modern',  -- classic, modern, minimal, detailed
    color_scheme JSONB DEFAULT '{}',
    
    -- Default content
    default_items JSONB DEFAULT '[]',
    default_notes TEXT,
    
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,  -- created, updated, deleted, sent, paid
    
    changes JSONB,  -- Before/after diff
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_invoices_org_id ON invoices(org_id);
CREATE INDEX idx_invoices_contact_id ON invoices(contact_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_number_search ON invoices USING gin(number gin_trgm_ops);

CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_contacts_name_search ON contacts USING gin(name gin_trgm_ops);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_attachments_invoice_id ON attachments(invoice_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for organizations)
CREATE POLICY "Users can view their own organizations"
    ON organizations FOR SELECT
    USING (owner_id = auth.uid() OR id IN (
        SELECT org_id FROM team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their organizations"
    ON organizations FOR UPDATE
    USING (owner_id = auth.uid() OR id IN (
        SELECT org_id FROM team_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ));
```

---

## 5. Internationalization (i18n)

### Architecture

```
src/
├── i18n/
│   ├── config.ts                 # Supported locales, default locale
│   ├── request.ts               # Server-side locale detection
│   └── navigation.ts            # Localized Link, useRouter
├── messages/
│   ├── en/
│   │   ├── common.json          # Shared translations
│   │   ├── invoice.json         # Invoice-specific terms
│   │   ├── legal.json           # Legal/compliance text
│   │   └── errors.json          # Error messages
│   ├── cs/
│   ├── de/
│   ├── ru/
│   └── ...
└── app/
    └── [locale]/
        ├── layout.tsx
        ├── page.tsx
        └── ...
```

### Configuration

```typescript
// src/i18n/config.ts
import { Pathnames } from 'next-intl/navigation';

export const locales = ['en', 'cs', 'de', 'sk', 'pl', 'ru'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  cs: 'Čeština',
  de: 'Deutsch',
  sk: 'Slovenčina',
  pl: 'Polski',
  ru: 'Русский',
};

export const localeToCountry: Record<Locale, string[]> = {
  en: ['GB', 'US', 'IE', 'AU'],
  cs: ['CZ'],
  de: ['DE', 'AT', 'CH'],
  sk: ['SK'],
  pl: ['PL'],
  ru: ['RU', 'BY', 'KZ'],
};

export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
  '/dashboard': '/dashboard',
  '/invoices': {
    en: '/invoices',
    cs: '/faktury',
    de: '/rechnungen',
    sk: '/faktury',
    pl: '/faktury',
    ru: '/scheta',
  },
  '/invoices/new': {
    en: '/invoices/new',
    cs: '/faktury/nova',
    de: '/rechnungen/neu',
    sk: '/faktury/nova',
    pl: '/faktury/nowa',
    ru: '/scheta/noviy',
  },
  // ...
};
```

### Translation Files Structure

```json
// messages/cs/invoice.json
{
  "invoice": {
    "title": "Faktura",
    "proforma": "Zálohová faktura",
    "creditNote": "Dobropis",
    "fields": {
      "number": "Číslo faktury",
      "issueDate": "Datum vystavení",
      "taxDate": "Datum uskutečnění zdanitelného plnění",
      "dueDate": "Datum splatnosti",
      "variableSymbol": "Variabilní symbol"
    },
    "supplier": {
      "title": "Dodavatel",
      "ico": "IČO",
      "dic": "DIČ"
    },
    "customer": {
      "title": "Odběratel"
    },
    "items": {
      "description": "Popis",
      "quantity": "Množství",
      "unit": "MJ",
      "unitPrice": "Cena za MJ",
      "vatRate": "DPH %",
      "total": "Celkem"
    },
    "totals": {
      "subtotal": "Základ daně",
      "vat": "DPH",
      "total": "Celkem k úhradě"
    },
    "payment": {
      "bankAccount": "Bankovní účet",
      "iban": "IBAN",
      "swift": "SWIFT/BIC",
      "vs": "VS",
      "ks": "KS",
      "ss": "SS"
    },
    "status": {
      "draft": "Koncept",
      "sent": "Odesláno",
      "paid": "Zaplaceno",
      "overdue": "Po splatnosti",
      "cancelled": "Stornováno"
    },
    "nonVatPayer": "Nejsem plátce DPH.",
    "reverseCharge": "Daň odvede zákazník."
  }
}
```

### Dynamic Formatting

```typescript
// src/lib/formatters.ts
import { useLocale, useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { cs, de, enGB, pl, ru, sk } from 'date-fns/locale';

const dateLocales = { en: enGB, cs, de, sk, pl, ru };

export function useFormatters() {
  const locale = useLocale();
  const t = useTranslations();
  
  const formatDate = (date: Date | string, pattern = 'PPP') => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, pattern, { locale: dateLocales[locale] });
  };
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };
  
  const formatTaxId = (taxId: string, countryCode: string) => {
    // Country-specific formatting
    const formatters: Record<string, (id: string) => string> = {
      CZ: (id) => id.replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3'),
      DE: (id) => id, // No formatting
      // ...
    };
    return formatters[countryCode]?.(taxId) ?? taxId;
  };
  
  return { formatDate, formatCurrency, formatNumber, formatTaxId };
}
```

---

## 6. Country-Specific Invoice Requirements

### Configuration Registry

```typescript
// src/lib/country-configs/index.ts

export interface CountryInvoiceConfig {
  code: string;
  name: string;
  currency: string;
  vatRates: VatRate[];
  requiredFields: RequiredField[];
  optionalFields: OptionalField[];
  taxIdConfig: TaxIdConfig;
  vatIdConfig: VatIdConfig;
  paymentConfig: PaymentConfig;
  validationRules: ValidationRule[];
  legalTexts: LegalTexts;
}

export interface VatRate {
  rate: number;
  name: string;
  description?: string;
  categories?: string[];
}

export interface RequiredField {
  field: string;
  label: string;
  type: 'string' | 'date' | 'number';
  validation?: string;  // Regex or validation function name
  helpText?: string;
}

// Country configurations
export const countryConfigs: Record<string, CountryInvoiceConfig> = {
  CZ: {
    code: 'CZ',
    name: 'Czech Republic',
    currency: 'CZK',
    vatRates: [
      { rate: 21, name: 'standard', description: 'Základní sazba' },
      { rate: 12, name: 'reduced', description: 'Snížená sazba' },
      { rate: 0, name: 'zero', description: 'Osvobozeno' },
    ],
    requiredFields: [
      { field: 'invoiceNumber', label: 'Číslo faktury', type: 'string' },
      { field: 'issueDate', label: 'Datum vystavení', type: 'date' },
      { field: 'taxDate', label: 'DUZP', type: 'date', helpText: 'Datum uskutečnění zdanitelného plnění' },
      { field: 'dueDate', label: 'Datum splatnosti', type: 'date' },
      { field: 'supplierIco', label: 'IČO dodavatele', type: 'string', validation: '^\\d{8}$' },
    ],
    optionalFields: [
      { field: 'variableSymbol', label: 'Variabilní symbol', type: 'string', default: 'invoiceNumber' },
      { field: 'constantSymbol', label: 'Konstantní symbol', type: 'string' },
      { field: 'specificSymbol', label: 'Specifický symbol', type: 'string' },
    ],
    taxIdConfig: {
      name: 'IČO',
      format: '^\\d{8}$',
      placeholder: '12345678',
      validationApi: 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest',
    },
    vatIdConfig: {
      name: 'DIČ',
      prefix: 'CZ',
      format: '^CZ\\d{8,10}$',
      placeholder: 'CZ12345678',
      validationApi: 'https://ec.europa.eu/taxation_customs/vies',
    },
    paymentConfig: {
      supportsQr: true,
      qrFormat: 'SPD',  // Short Payment Descriptor
      bankAccountFormat: 'czech',  // 123456-1234567890/0100
      ibanSupported: true,
    },
    validationRules: [
      { rule: 'taxDateRequired', condition: 'isVatPayer', message: 'DUZP je povinné pro plátce DPH' },
      { rule: 'reverseChargeNote', condition: 'isReverseCharge', message: 'Musí obsahovat text o přenesení daňové povinnosti' },
    ],
    legalTexts: {
      nonVatPayer: 'Nejsem plátce DPH.',
      reverseCharge: 'Daň odvede zákazník.',
      physicalPerson: 'Fyzická osoba zapsaná v živnostenském rejstříku.',
    },
  },
  
  DE: {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    vatRates: [
      { rate: 19, name: 'standard', description: 'Regelsteuersatz' },
      { rate: 7, name: 'reduced', description: 'Ermäßigter Steuersatz' },
      { rate: 0, name: 'zero', description: 'Steuerfrei' },
    ],
    requiredFields: [
      { field: 'invoiceNumber', label: 'Rechnungsnummer', type: 'string' },
      { field: 'issueDate', label: 'Rechnungsdatum', type: 'date' },
      { field: 'deliveryDate', label: 'Lieferdatum', type: 'date', helpText: 'Leistungsdatum' },
      { field: 'dueDate', label: 'Zahlungsziel', type: 'date' },
    ],
    optionalFields: [
      { field: 'bestellnummer', label: 'Bestellnummer', type: 'string' },
    ],
    taxIdConfig: {
      name: 'Steuernummer',
      format: '^\\d{2,3}\\/\\d{3}\\/\\d{5}$',
      placeholder: '12/345/67890',
    },
    vatIdConfig: {
      name: 'USt-IdNr.',
      prefix: 'DE',
      format: '^DE\\d{9}$',
      placeholder: 'DE123456789',
      validationApi: 'https://ec.europa.eu/taxation_customs/vies',
    },
    paymentConfig: {
      supportsQr: true,
      qrFormat: 'EPC',  // European Payment Council QR
      ibanSupported: true,
      sepaRequired: true,
    },
    validationRules: [
      { rule: 'ustIdRequired', condition: 'isB2B && crossBorder', message: 'USt-IdNr. erforderlich bei grenzüberschreitenden B2B-Geschäften' },
      { rule: 'kleinunternehmerNote', condition: 'isSmallBusiness', message: 'Hinweis nach §19 UStG erforderlich' },
    ],
    legalTexts: {
      smallBusiness: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.',
      reverseCharge: 'Steuerschuldnerschaft des Leistungsempfängers.',
    },
  },
  
  SK: {
    code: 'SK',
    name: 'Slovakia',
    currency: 'EUR',
    vatRates: [
      { rate: 20, name: 'standard', description: 'Základná sadzba' },
      { rate: 10, name: 'reduced', description: 'Znížená sadzba' },
      { rate: 0, name: 'zero', description: 'Oslobodené' },
    ],
    requiredFields: [
      { field: 'invoiceNumber', label: 'Číslo faktúry', type: 'string' },
      { field: 'issueDate', label: 'Dátum vystavenia', type: 'date' },
      { field: 'taxDate', label: 'Dátum dodania', type: 'date' },
      { field: 'dueDate', label: 'Dátum splatnosti', type: 'date' },
      { field: 'supplierIco', label: 'IČO', type: 'string', validation: '^\\d{8}$' },
    ],
    optionalFields: [
      { field: 'variableSymbol', label: 'Variabilný symbol', type: 'string' },
    ],
    taxIdConfig: {
      name: 'IČO',
      format: '^\\d{8}$',
      placeholder: '12345678',
    },
    vatIdConfig: {
      name: 'IČ DPH',
      prefix: 'SK',
      format: '^SK\\d{10}$',
      placeholder: 'SK1234567890',
      validationApi: 'https://ec.europa.eu/taxation_customs/vies',
    },
    paymentConfig: {
      supportsQr: true,
      qrFormat: 'PAY',  // Slovak QR payment standard
      ibanSupported: true,
    },
    validationRules: [],
    legalTexts: {
      nonVatPayer: 'Nie som platiteľ DPH.',
      reverseCharge: 'Prenesenie daňovej povinnosti.',
    },
  },
  
  // Add more countries as needed...
};

// Helper to get config for a country
export function getCountryConfig(code: string): CountryInvoiceConfig | undefined {
  return countryConfigs[code.toUpperCase()];
}

// Get all supported countries
export function getSupportedCountries(): string[] {
  return Object.keys(countryConfigs);
}
```

### Dynamic Form Generation

```typescript
// src/components/invoice/CountryFields.tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { getCountryConfig } from '@/lib/country-configs';

interface CountryFieldsProps {
  countryCode: string;
  type: 'supplier' | 'customer';
}

export function CountryFields({ countryCode, type }: CountryFieldsProps) {
  const t = useTranslations('invoice');
  const config = getCountryConfig(countryCode);
  const { register, formState: { errors } } = useFormContext();
  
  if (!config) return null;
  
  return (
    <div className="space-y-3">
      {/* Tax ID */}
      <div>
        <label className="text-xs font-medium text-neutral-500">
          {config.taxIdConfig.name}
        </label>
        <input
          {...register(`${type}.taxId`, {
            pattern: {
              value: new RegExp(config.taxIdConfig.format),
              message: t('errors.invalidTaxId', { format: config.taxIdConfig.placeholder }),
            },
          })}
          placeholder={config.taxIdConfig.placeholder}
          className="mt-1 input-compact"
        />
      </div>
      
      {/* VAT ID (if applicable) */}
      {config.vatIdConfig && (
        <div>
          <label className="text-xs font-medium text-neutral-500">
            {config.vatIdConfig.name}
          </label>
          <input
            {...register(`${type}.vatId`, {
              pattern: {
                value: new RegExp(config.vatIdConfig.format),
                message: t('errors.invalidVatId'),
              },
            })}
            placeholder={config.vatIdConfig.placeholder}
            className="mt-1 input-compact"
          />
        </div>
      )}
      
      {/* Country-specific required fields */}
      {config.requiredFields
        .filter(f => f.field.startsWith(type))
        .map(field => (
          <div key={field.field}>
            <label className="text-xs font-medium text-neutral-500">
              {field.label}
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              {...register(field.field, { required: true })}
              type={field.type === 'date' ? 'date' : 'text'}
              className="mt-1 input-compact"
            />
            {field.helpText && (
              <p className="text-xs text-neutral-400 mt-0.5">{field.helpText}</p>
            )}
          </div>
        ))}
    </div>
  );
}
```

---

## 7. LLM Integration (Groq)

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      OCR Processing Pipeline                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ Upload  │───▶│ Preproc │───▶│  Groq   │───▶│ Post-   │       │
│  │         │    │         │    │   LLM   │    │ process │       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
│       │              │              │              │             │
│       ▼              ▼              ▼              ▼             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ Validate│    │ Optimize│    │ Extract │    │ Validate│       │
│  │ Format  │    │ Image   │    │ + Parse │    │ + Enrich│       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Groq Client Setup

```typescript
// src/lib/groq/client.ts
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export { groq };

// Model selection based on task
export const MODELS = {
  // For text extraction from images (vision)
  vision: 'llava-v1.5-7b-4096-preview',
  // For text processing and structuring
  text: 'mixtral-8x7b-32768',
  // For fast, simple tasks
  fast: 'llama3-8b-8192',
} as const;

export type ModelType = keyof typeof MODELS;
```

### Invoice OCR Service

```typescript
// src/lib/groq/invoice-ocr.ts
import { groq, MODELS } from './client';
import { getCountryConfig } from '../country-configs';
import { z } from 'zod';

// Schema for extracted invoice data
const ExtractedInvoiceSchema = z.object({
  confidence: z.number().min(0).max(1),
  type: z.enum(['invoice', 'proforma', 'credit_note', 'receipt', 'unknown']),
  
  // Dates
  issueDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  taxDate: z.string().nullable(),
  
  // Identifiers
  invoiceNumber: z.string().nullable(),
  variableSymbol: z.string().nullable(),
  orderNumber: z.string().nullable(),
  
  // Supplier
  supplier: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    taxId: z.string().nullable(),
    vatId: z.string().nullable(),
    bankAccount: z.string().nullable(),
    iban: z.string().nullable(),
  }),
  
  // Customer
  customer: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    taxId: z.string().nullable(),
    vatId: z.string().nullable(),
  }),
  
  // Currency and amounts
  currency: z.string().nullable(),
  subtotal: z.number().nullable(),
  vatBreakdown: z.array(z.object({
    rate: z.number(),
    base: z.number(),
    amount: z.number(),
  })),
  total: z.number().nullable(),
  
  // Items (if extractable)
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().nullable(),
    unit: z.string().nullable(),
    unitPrice: z.number().nullable(),
    vatRate: z.number().nullable(),
    total: z.number().nullable(),
  })),
  
  // Payment info
  payment: z.object({
    method: z.string().nullable(),
    bankAccount: z.string().nullable(),
    iban: z.string().nullable(),
    bic: z.string().nullable(),
    variableSymbol: z.string().nullable(),
  }),
  
  // Raw text for reference
  rawText: z.string().optional(),
  
  // Language detected
  language: z.string().nullable(),
  
  // Country detected
  countryCode: z.string().nullable(),
});

export type ExtractedInvoice = z.infer<typeof ExtractedInvoiceSchema>;

// System prompt for invoice extraction
const EXTRACTION_SYSTEM_PROMPT = `You are an expert invoice data extraction system. Your task is to analyze invoice images and extract structured data with high accuracy.

IMPORTANT RULES:
1. Extract ALL visible data, even if partially obscured
2. For ambiguous values, provide your best interpretation with lower confidence
3. Detect the language and country of origin
4. Recognize various date formats and normalize to ISO 8601 (YYYY-MM-DD)
5. Identify currency from symbols (Kč, €, $, £) or codes (CZK, EUR, USD, GBP)
6. Extract IBAN, local bank accounts, and payment references
7. Recognize VAT rates and calculate breakdowns if not explicit
8. For Czech invoices, look for IČO (8 digits) and DIČ (CZ + 8-10 digits)
9. For German invoices, look for Steuernummer and USt-IdNr.

OUTPUT FORMAT:
Return ONLY valid JSON matching