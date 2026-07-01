/**
 * Seed du Back Office (Sprint 14) — idempotent.
 *
 * Insère : permissions RBAC, rôles + associations, feature flags, plans et
 * paramètres système. Optionnel : promeut un utilisateur en SUPER_ADMIN via la
 * variable d'environnement `ADMIN_EMAIL`.
 *
 * Lancement : `npm run db:seed:admin`
 */
import "dotenv/config";
import { PrismaClient, PlanTier, SystemSettingType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/** Permissions unitaires (clé → description). */
const PERMISSIONS: Record<string, string> = {
  "users.view": "Consulter les utilisateurs",
  "users.suspend": "Suspendre / réactiver un utilisateur",
  "users.delete": "Supprimer (soft delete) un utilisateur",
  "users.role": "Changer le rôle d'un utilisateur",
  "plans.view": "Consulter les plans",
  "plans.manage": "Créer / modifier les plans",
  "subscriptions.view": "Consulter les abonnements",
  "analytics.view": "Consulter les analytics",
  "audit.view": "Consulter le journal d'audit",
  "flags.view": "Consulter les feature flags",
  "flags.manage": "Activer / désactiver les feature flags",
  "settings.view": "Consulter les paramètres système",
  "settings.manage": "Modifier les paramètres système",
  "reports.view": "Consulter les rapports",
  "notifications.manage": "Gérer les notifications système",
};

/** Matrice rôle → permissions (miroir de lib/admin/rbac.ts). */
const ROLE_PERMISSIONS: Record<string, { description: string; permissions: string[] }> = {
  SUPER_ADMIN: {
    description: "Accès total à la plateforme",
    permissions: Object.keys(PERMISSIONS),
  },
  ADMIN: {
    description: "Gestion opérationnelle (hors suppression et paramètres critiques)",
    permissions: [
      "users.view",
      "users.suspend",
      "users.role",
      "plans.view",
      "plans.manage",
      "subscriptions.view",
      "analytics.view",
      "audit.view",
      "flags.view",
      "flags.manage",
      "settings.view",
      "reports.view",
      "notifications.manage",
    ],
  },
  SUPPORT: {
    description: "Support client (consultation + modération de base)",
    permissions: [
      "users.view",
      "users.suspend",
      "subscriptions.view",
      "audit.view",
      "notifications.manage",
    ],
  },
  ANALYST: {
    description: "Analyse (lecture seule des données)",
    permissions: [
      "analytics.view",
      "users.view",
      "subscriptions.view",
      "reports.view",
      "audit.view",
    ],
  },
};

const FEATURE_FLAGS = [
  {
    key: "ai",
    label: "Assistant IA",
    description: "Active l'assistant financier IA.",
    enabled: true,
  },
  {
    key: "reports",
    label: "Rapports",
    description: "Active le module de rapports/exports.",
    enabled: true,
  },
  {
    key: "notifications",
    label: "Notifications",
    description: "Active le centre de notifications.",
    enabled: true,
  },
  {
    key: "premium",
    label: "Offres Premium",
    description: "Active les fonctionnalités payantes (préparation Sprint 15).",
    enabled: false,
  },
];

const PLANS = [
  {
    tier: PlanTier.FREE,
    name: "Gratuit",
    price: 0,
    maxBudgets: 3,
    maxGoals: 2,
    maxAiChats: 10,
    features: ["Suivi des revenus et dépenses", "Tableau de bord", "3 budgets", "2 objectifs"],
    description: "Pour démarrer la gestion de son budget.",
  },
  {
    tier: PlanTier.PRO,
    name: "Pro",
    price: 2000,
    maxBudgets: 20,
    maxGoals: 15,
    maxAiChats: 100,
    features: ["Tout le plan Gratuit", "Budgets illimités", "Assistant IA", "Rapports avancés"],
    description: "Pour les particuliers exigeants.",
  },
  {
    tier: PlanTier.BUSINESS,
    name: "Business",
    price: 10000,
    maxBudgets: null,
    maxGoals: null,
    maxAiChats: 500,
    features: ["Tout le plan Pro", "Multi-comptes", "Exports illimités", "Support prioritaire"],
    description: "Pour les commerçants et TPE.",
  },
  {
    tier: PlanTier.ENTERPRISE,
    name: "Enterprise",
    price: 50000,
    maxBudgets: null,
    maxGoals: null,
    maxAiChats: null,
    features: [
      "Tout le plan Business",
      "SLA dédié",
      "Intégrations sur mesure",
      "Gestionnaire de compte",
    ],
    description: "Pour les organisations.",
  },
];

const SYSTEM_SETTINGS = [
  {
    key: "app_name",
    value: "HookBudget",
    type: SystemSettingType.STRING,
    label: "Nom de l'application",
  },
  { key: "app_logo_url", value: "", type: SystemSettingType.STRING, label: "URL du logo" },
  {
    key: "maintenance_mode",
    value: "false",
    type: SystemSettingType.BOOLEAN,
    label: "Mode maintenance",
  },
  {
    key: "system_message",
    value: "",
    type: SystemSettingType.STRING,
    label: "Message système (bandeau)",
  },
  {
    key: "support_email",
    value: "support@hookbudget.app",
    type: SystemSettingType.STRING,
    label: "E-mail de support",
  },
  {
    key: "default_currency",
    value: "XOF",
    type: SystemSettingType.STRING,
    label: "Devise par défaut",
  },
];

async function main() {
  console.info("🌱 Seed Back Office…");

  // Permissions
  for (const [key, description] of Object.entries(PERMISSIONS)) {
    await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });
  }

  // Rôles + associations
  for (const [name, { description, permissions }] of Object.entries(ROLE_PERMISSIONS)) {
    await prisma.role.upsert({
      where: { name },
      update: {
        description,
        permissions: { set: permissions.map((key) => ({ key })) },
      },
      create: {
        name,
        description,
        permissions: { connect: permissions.map((key) => ({ key })) },
      },
    });
  }

  // Feature flags
  for (const flag of FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { label: flag.label, description: flag.description },
      create: flag,
    });
  }

  // Plans
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: {
        name: plan.name,
        price: plan.price,
        features: plan.features,
        description: plan.description,
      },
      create: plan,
    });
  }

  // Paramètres système
  for (const s of SYSTEM_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { label: s.label },
      create: s,
    });
  }

  // Promotion optionnelle d'un SUPER_ADMIN
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const updated = await prisma.user.updateMany({
      where: { email: adminEmail },
      data: { adminRole: "SUPER_ADMIN" },
    });
    console.info(
      updated.count > 0
        ? `👑 ${adminEmail} promu SUPER_ADMIN.`
        : `⚠️ Aucun utilisateur ${adminEmail} trouvé (promotion ignorée).`,
    );
  }

  console.info("✅ Seed Back Office terminé.");
}

main()
  .catch((error) => {
    console.error("❌ Échec du seed admin :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
