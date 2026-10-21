# Leopard International Shipping — Digital Platform

> النسخة الحالية هي أساس MVP تقني وموقع عام أولي، وليست نظام تشغيل إنتاجيًا كاملًا. تفاصيل الاتصال الرسمية، سياسة الخصوصية، قاعدة البيانات، ومصادر التكامل لم تُقدَّم بعد.

## ملخص سريع

- **الموقع:** Next.js App Router + TypeScript، بواجهتين `ar` و`en`، والعربية هي الافتراضية (`/ar`).
- **المسار التجاري الأول:** نموذج Freight RFQ متعدد الخطوات، مع Zod validation وشروط حسب وسيلة النقل.
- **البيانات:** PostgreSQL + Prisma schema، مع منع تكرار الشركة/جهة التواصل قدر الإمكان، سجل حالة RFQ وTransactional Outbox.
- **الأمان:** واجهة التخزين لا تقبل الطلبات قبل ضبط قاعدة البيانات، مفتاح تحديد المعدل، واعتماد إشعار الخصوصية. لا يوجد CRM/Admin أو رفع ملفات في هذه النسخة.
- **Index Logistics:** منصة منفصلة؛ الصفحة تعريفية ولا يوجد تكامل أو مشاركة بيانات حتى الآن.
- **المرفقات المصدرية:** لم تكن المستندات الأربعة المذكورة في الطلب موجودة في مساحة العمل. انظر `docs/architecture/requirements-traceability.md`.

## تشغيل محلي

يتطلب Node.js 22+ وnpm 10.8+. تم تنفيذ الفحوصات في مساحة العمل على Node.js 20.20.2 رغم تحذير محرك اختياري من Prisma؛ بيئة التطوير وCI موصى بها على Node 22.

```bash
cp .env.example .env
# اضبط DATABASE_URL وبيانات PostgreSQL محلية عند اختبار التخزين

docker compose -f infrastructure/docker/docker-compose.yml up -d
npm install
npm run db:generate
npm run db:validate
npm run db:migrate
npm run dev
```

ثم افتح:

- `http://localhost:3000/ar`
- `http://localhost:3000/en`
- `/` يحوّل إلى `/ar`.

قبل أن يحفظ نموذج طلب الشحن بيانات فعلية، يلزم إعداد `RATE_LIMIT_HMAC_SECRET` بطول 32 حرفًا على الأقل، وبعد مراجعة واعتماد إشعار الخصوصية فقط يتم ضبط `PRIVACY_NOTICE_APPROVED=true`. في الوضع الحالي، إذا لم تتوفر هذه الإعدادات فستظهر رسالة واضحة بأن الطلب لم يُرسل ولم يُحفظ.

## الفحوصات

```bash
npm run db:validate
npm run lint
npm run typecheck
npm test
npm run build
```

لا تُعتبر هذه الفحوصات ناجحة إلا بعد تشغيلها فعليًا. لا توجد بيانات عملاء حقيقية أو أسعار أو شهادات أو تكاملات نشطة في المستودع.

## وثائق المشروع

- `docs/architecture/initial-assessment.md` — تقييم، تصميم معماري، خطة مراحل وتكاليف تقديرية.
- `docs/architecture/requirements-traceability.md` — مصفوفة المتطلبات ومعلومات المصدر المفقودة.
- `docs/database/erd.md` — ERD التصوري ونطاق Prisma MVP.
- `docs/api/rfq-contract.md` — عقد API لطلبات الشحن.
- `docs/security/threat-model.md` — نموذج تهديدات أولي.
- `docs/deployment/local-development.md` — إعداد التطوير ومتطلبات الإطلاق.
- `automation/n8n/README.md` — حدود تكامل n8n والخطوة المقترحة.

## ملاحظة تشغيلية مهمة

الصفحات القانونية الحالية **مسودات توضيحية** وليست مشورة قانونية أو سياسة معتمدة. كما أن بيانات الشركة الرسمية (الشعار، الدومين، البريد، الهاتف، العنوان، حدود الترخيص) تحتاج اعتماد المالك قبل الإطلاق. راجع سجل الـ blockers في مصفوفة التتبّع.
