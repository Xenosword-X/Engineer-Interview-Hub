# Engineer Interview Hub — 平台擴充設計 Spec

**日期：** 2026-05-05  
**狀態：** Draft（待使用者確認）  
**作者：** Claude Code + 使用者

---

## 1. 目標與範圍

### 目標
將平台從「前端工程師面試題庫（FE Interview Hub）」擴充為「全端工程師面試平台（Engineer Interview Hub）」，支援前端、後端、資料工程、DevOps 四大工程師類型的題庫，以及涵蓋上述四類加全端共五種類型的 AI 模擬面試。

### 範圍內（此次擴充）
- ✅ 平台更名：FE Interview Hub → Engineer Interview Hub
- ✅ 題庫新增 3 個 domain：Backend、Data Engineering、DevOps
- ✅ AI 面試支援 5 種工程師類型：Frontend / Backend / Data Engineering / DevOps / Full-stack
- ✅ AI 面試難度簡化：junior / mid / senior → junior / senior
- ✅ Domain 模組化架構：每個 domain 有獨立 prompt、STT 術語、取樣策略
- ✅ 設定頁 UI 重設計：2-step flow（選類型 → 選細節）
- ✅ 首頁題庫導覽：Domain Tabs + Category Cards
- ✅ Admin 後台支援 domain 欄位
- ✅ UI 實作階段呼叫 `ui-ux-pro-max` skill 設計介面

### 範圍外
- ❌ 混搭多 domain 面試（每場綁定單一類型）
- ❌ 題目內容自動生成存回 DB（仍由 Admin 人工審核後發布）
- ❌ 既有前端題目的任何修改
- ❌ 全新的 DB 表或認證邏輯
- ❌ Mobile / ML / Security 等其他工程師類型（留待未來擴充）

---

## 2. 平台更名

| 項目 | 舊值 | 新值 |
|------|------|------|
| 網站標題 | FE Interview Hub | Engineer Interview Hub |
| Header logo 文字 | FE Interview Hub | Engineer Interview Hub |
| OG image 文字 | 前端工程師面試題庫 | 全端工程師面試題庫 |
| `i18n` site.title | FE Interview Hub | Engineer Interview Hub |
| README / PRD 標題 | FE Interview Hub | Engineer Interview Hub |
| `NUXT_PUBLIC_SITE_URL` | 不變（由部署環境設定） | — |

---

## 3. 資料庫 Schema 變更

### 3.1 `questions` 表：新增 `domain` 欄位

```sql
-- 安全：有 DEFAULT，不需停機，不影響現有查詢
alter table questions
  add column domain text not null default 'frontend';

create index idx_questions_domain on questions(domain);

-- 驗證現有資料（應全部為 'frontend'）
select domain, count(*) from questions group by domain;
```

**注意：** `DEFAULT 'frontend'` 確保所有現有題目自動補值，不需要手動 backfill，也不影響任何現有 API 查詢。

### 3.2 `interview_sessions` 表：不動欄位結構

`target_role` 欄位保持 `text` 型別不變，只在應用層擴充有效字串值：

| 舊有效值 | 新增有效值 |
|---------|-----------|
| `frontend-junior` | `backend-junior` |
| `frontend-mid`（保留，歷史資料相容） | `backend-senior` |
| `frontend-senior` | `data-engineering-junior` |
| | `data-engineering-senior` |
| | `devops-junior` |
| | `devops-senior` |
| | `fullstack-junior` |
| | `fullstack-senior` |

**注意：** 舊的 `frontend-mid` 值不刪除，歷史記錄正常顯示。

### 3.3 parseTargetRole 工具函式（新增）

```ts
// server/utils/interview/parseTargetRole.ts
export function parseTargetRole(raw: string): { roleType: RoleType; seniority: Seniority } {
  const lastDash = raw.lastIndexOf('-')
  const roleType = raw.slice(0, lastDash) as RoleType
  const seniority = raw.slice(lastDash + 1) as Seniority
  return { roleType, seniority }
}
```

---

## 4. Domain 模組系統

### 4.1 DomainConfig 介面

```ts
// server/utils/interview/domains/types.ts
export type RoleType = 'frontend' | 'backend' | 'data-engineering' | 'devops' | 'fullstack'
export type Seniority = 'junior' | 'senior'

export interface DomainConfig {
  roleType: RoleType
  categories: string[]
  sttTerms: string[]
  pickStrategy: 'single-domain' | 'composite'
  systemPrompt: (state: InterviewState) => string
  summaryPrompt: (locale: 'zh' | 'en') => string
}
```

### 4.2 目錄結構

```
server/utils/interview/domains/
├── types.ts              # DomainConfig 介面 + RoleType / Seniority 型別
├── index.ts              # getDomain(roleType: RoleType): DomainConfig
├── frontend.ts           # 現有 prompts.ts 邏輯遷移進來
├── backend.ts            # 新增
├── data-engineering.ts   # 新增
├── devops.ts             # 新增
└── fullstack.ts          # composite：組合 frontend + backend
```

### 4.3 各 Domain 規格

#### Frontend（遷移自現有 prompts.ts）
- **面試官人設：** Senior Frontend Team Lead
- **Categories：** `javascript`, `vue`, `css`, `html`, `web-vitals`, `browser`, `behavioral`
- **STT 術語：** React, Vue, useState, Virtual DOM, SSR, Hydration, Webpack, Vite, TypeScript, Web Vitals, LCP, CLS, FID

#### Backend
- **面試官人設：** Senior Backend Engineer / Tech Lead
- **評估重點：** API 設計、系統擴展性、應用資料庫設計、安全性、效能
- **Categories：** `api-design`, `language`, `database`, `system-design`, `security`, `performance`
- **邊界定義：** `database` 僅涵蓋 OLTP / application-serving data（transactions、index strategy、query plan、locking、consistency），不包含 warehouse / ETL / analytics SQL。
- **STT 術語：** REST, GraphQL, gRPC, JWT, OAuth, Redis, PostgreSQL, microservices, ACID, CAP theorem, Node.js, Python, FastAPI, Spring Boot, message queue, load balancer

#### Data Engineering
- **面試官人設：** Senior Data Engineer / Data Platform Lead
- **評估重點：** 分析型 SQL、Pipeline orchestration、資料倉儲建模、分散式處理框架、資料品質與可觀測性
- **Categories：** `sql-transformation`, `pipeline-orchestration`, `warehouse-modeling`, `batch-processing`, `stream-processing`, `data-quality-observability`
- **邊界定義：** `sql-transformation` 專注 analytics / transformation SQL，不和 backend 的 application DB 題重疊；`data-quality-observability` 收 freshness、lineage、schema evolution、DQ checks、alerts。
- **STT 術語：** ETL, ELT, Spark, Kafka, Airflow, dbt, Snowflake, BigQuery, Parquet, Delta Lake, CDC, Redshift, Hadoop, HDFS, data lineage, schema registry, Great Expectations, freshness SLA

#### DevOps / SRE
- **面試官人設：** Senior DevOps Engineer / SRE
- **評估重點：** 基礎建設、CI/CD、可觀測性、可靠性工程
- **Categories：** `containers-platform`, `infrastructure-as-code`, `delivery-automation`, `cloud-architecture`, `observability`, `reliability-sre`
- **邊界定義：** `containers-platform` 合併容器 runtime 與 K8s workload 基礎；`reliability-sre` 專收 SLO/SLI、error budget、incident response、capacity planning、resilience tradeoff。
- **STT 術語：** Docker, Kubernetes, Helm, Terraform, Ansible, Prometheus, Grafana, GitHub Actions, Jenkins, SLA, SLO, SLI, ELK Stack, AWS, GCP, Azure, blue-green deployment, canary release, incident response, postmortem

#### Full-stack（Composite）
- **面試官人設：** Senior Full-stack Tech Lead
- **評估重點：** 前後端技術判斷能力 + 整合設計能力
- **Categories：** frontend.categories + backend.categories
- **STT 術語：** frontend.sttTerms + backend.sttTerms
- **pickStrategy：** `composite`（前後端各取 50%）
- **systemPrompt：** 不直接使用 frontend 或 backend prompt，改為描述「評估全端能力的 Tech Lead」

### 4.4 Seniority 在 Prompt 的差異

所有 domain 的 systemPrompt 使用同一份 template，透過 `seniority` 條件段落切換：

| | Junior | Senior |
|---|---|---|
| 題目深度 | 基礎概念與實作 | 架構決策與取捨 |
| 追問風格 | 給予引導提示 | 直接追問「如果規模 10x 你怎麼設計」 |
| 行為題重點 | 學習能力、協作 | 領導力、跨團隊溝通、技術決策 |

### 4.5 `pickQuestionPool.ts` 變更

```ts
// 單一 domain
const pool = await supabase
  .from('questions')
  .select(...)
  .eq('domain', session.roleType)
  .in('category', session.targetCategories)

// composite（fullstack）
const pool = await supabase
  .from('questions')
  .select(...)
  .in('domain', ['frontend', 'backend'])
  .in('category', session.targetCategories)
// 取樣時確保前後端各佔約 50%
```

---

## 5. 題庫分類與目標題數

| Domain | Categories | 目標題數（MVP） |
|--------|-----------|--------------|
| Frontend | 7 個（既有） | 80+（已有，維持） |
| Backend | `api-design`, `language`, `database`, `system-design`, `security`, `performance` | 60+（每類 ~10 題） |
| Data Engineering | `sql-transformation`, `pipeline-orchestration`, `warehouse-modeling`, `batch-processing`, `stream-processing`, `data-quality-observability` | 48+（每類 ~8 題） |
| DevOps | `containers-platform`, `infrastructure-as-code`, `delivery-automation`, `cloud-architecture`, `observability`, `reliability-sre` | 48+（每類 ~8 題） |

題目由 Admin 後台透過現有 CRUD 功能新增（選好 domain + category），可用 AI 輔助產題後人工審核發布。

---

## 6. UI 設計

> **重要：** UI 實作階段必須呼叫 `ui-ux-pro-max` skill，進行介面視覺細節設計（色彩、排版、元件風格），確保設計品質與現有 UI 一致。

### 6.1 `/interview` 設定頁（2-Step Flow）

**Step 1 — 選擇工程師類型**
- 5 張卡片（Frontend / Backend / Data Engineering / DevOps / Full-stack）
- 卡片顯示：icon、職稱、一行描述
- 選中後卡片高亮，進入 Step 2

**Step 2 — 設定細節（選完類型後展開）**
- **Seniority：** Junior（0-3 年） / Senior（3 年以上）— radio，必選
- **目標領域：** 依所選 domain 動態顯示對應 categories — checkbox，至少選 1
  - Full-stack 分兩組顯示：「前端領域」+ 「後端領域」

### 6.2 首頁題庫導覽

- 現有分類 Grid 上方加 Domain Filter Tabs：`全部 | Frontend | Backend | Data Engineering | DevOps`
- 點選 Tab 後顯示該 domain 的 Category Cards + 題目數量
- 預設顯示「全部」（保持現有行為）

### 6.3 Admin 後台調整

- 題目新增/編輯表單：加 **Domain 下拉選單**（必填，預設 `frontend`）
- 題目列表：加 Domain 欄位 + Domain 篩選器

### 6.4 i18n 新增字串

```json
{
  "site": {
    "title": "Engineer Interview Hub",
    "description": "精選 200+ 工程師面試題，涵蓋前端、後端、資料工程、DevOps，搭配 AI 即時評分與完整模擬面試流程"
  },
  "interview": {
    "setup": {
      "selectRole": "選擇工程師類型",
      "roles": {
        "frontend": "前端工程師",
        "backend": "後端工程師",
        "data-engineering": "資料工程師",
        "devops": "DevOps / SRE",
        "fullstack": "全端工程師"
      },
      "roleDescriptions": {
        "frontend": "HTML、CSS、JavaScript、Vue/React、瀏覽器原理",
        "backend": "API 設計、資料庫、系統架構、安全性",
        "data-engineering": "SQL、Pipeline、資料倉儲、串流處理",
        "devops": "容器化、CI/CD、雲端平台、可觀測性",
        "fullstack": "前後端整合、全端架構設計"
      },
      "seniority": {
        "label": "經驗等級",
        "junior": "初階（0-3 年）",
        "senior": "資深（3 年以上）"
      }
    }
  },
  "questions": {
    "domains": {
      "all": "全部",
      "frontend": "前端",
      "backend": "後端",
      "data-engineering": "資料工程",
      "devops": "DevOps"
    }
  }
}
```

---

## 7. 變更地圖與工程量估算

| 層級 | 變更內容 | 估算工時 |
|------|---------|---------|
| 品牌 / i18n | 更名 + 新字串 | 0.5 天 |
| DB Schema | 加 `questions.domain` 欄位 | 0.5 天（含驗證） |
| Server：Domain 模組 | 4 個新 domain 模組 + fullstack + index | 2-3 天 |
| Server：pickQuestionPool | 支援 composite 取樣 | 0.5 天 |
| Server：API 入口 | `/api/interview/start` 接收新 roleType/seniority | 0.5 天 |
| Client：Composables | `useInterviewSession` 支援新 roleType | 0.5 天 |
| Client：設定頁 UI | 2-step flow（呼叫 ui-ux-pro-max） | 2 天 |
| Client：首頁 Domain Tabs | Domain filter + category cards | 1 天 |
| Admin：domain 欄位 | 表單 + 列表 | 0.5 天 |
| 測試 | 新 domain 模組 unit tests | 1 天 |
| 題目內容 | 156+ 題（AI 輔助產題 + 人工審核） | 視速度而定 |
| **合計（程式碼）** | | **約 9-10 天** |

---

## 8. 實作分階段建議

### Phase 1：基礎建設（2-3 天）
- DB migration（加 `domain` 欄位）
- Domain 模組系統（4 domains + fullstack + getDomain factory）
- parseTargetRole 工具函式
- pickQuestionPool composite 支援
- Unit tests 全綠

### Phase 2：AI 面試更新（2 天）
- `/api/interview/start` 接收新 roleType/seniority
- `buildTurnMessages.ts` 改呼叫 `getDomain().systemPrompt()`
- `useInterviewSession.ts` 更新
- 手動跑 5 種面試類型的 smoke test

### Phase 3：UI 重設計（3 天，呼叫 ui-ux-pro-max）
- 平台更名（Header、OG、i18n）
- 設定頁 2-step flow
- 首頁 Domain Tabs

### Phase 4：Admin + 題目內容（持續進行）
- Admin domain 欄位
- 批量新增 156+ 題（AI 輔助 + 人工審核）

### Phase 5：合併前驗證
- 所有 unit + integration tests 綠燈
- `npm run build` 無錯
- 手動 Golden Path QA（5 種面試類型各跑一次）
- PR review + merge

---

## 9. 向下相容性保證

| 項目 | 保證 |
|------|------|
| 現有前端題目 | 完全不影響，`domain='frontend'` 自動補值 |
| 現有歷史面試記錄 | `target_role` 欄位不動，舊值繼續有效 |
| 現有 API 查詢 | 新增欄位不破壞現有 SELECT |
| 現有前端 category 頁面 | 路由與邏輯不變 |
| 現有用戶配額 | 邏輯不變，5 種類型共用同一配額計數 |
