import { login, baseUrl } from './lib/auth_helper.js';
import { sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { app_info_scenario } from './scripts/app_info.js';
import { master_config_scenario } from './scripts/master_config.js';
import { system_scenario } from './scripts/system.js';
import { nav_scenario } from './scripts/nav.js';
import { auth_scenario } from './scripts/auth.js';
import { sessions_scenario } from './scripts/sessions.js';
import { notifications_scenario } from './scripts/notifications.js';
import { users_scenario } from './scripts/users.js';
import { roles_scenario } from './scripts/roles.js';
import { organizations_scenario } from './scripts/organizations.js';
import { references_scenario } from './scripts/references.js';
import { reference_details_scenario } from './scripts/reference_details.js';
import { transactions_scenario } from './scripts/transactions.js';
import { batches_scenario } from './scripts/batches.js';
import { business_partners_scenario } from './scripts/business_partners.js';
import { me_scenario } from './scripts/me.js';
import { menu_scenario } from './scripts/menu.js';
import { permissions_scenario } from './scripts/permissions.js';
import { approvals_scenario } from './scripts/approvals.js';
import { audit_logs_scenario } from './scripts/audit_logs.js';
import { incident_logs_scenario } from './scripts/incident_logs.js';
import { dealer_participants_scenario } from './scripts/dealer_participants.js';
import { groups_scenario } from './scripts/groups.js';
import { prices_scenario } from './scripts/prices.js';
import { api_users_scenario } from './scripts/api_users.js';
import { reporting_scenario } from './scripts/reporting.js';
import { egr_scenario } from './scripts/egr.js';
import { etf_scenario } from './scripts/etf.js';

export const options = {
    scenarios: {
        app_info: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_app_info',
        },
        master_config: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_master_config',
        },
        system: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_system',
        },
        nav: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_nav',
        },
        auth: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_auth',
        },
        sessions: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_sessions',
        },
        notifications: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_notifications',
        },
        users: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_users',
        },
        roles: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_roles',
        },
        organizations: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_organizations',
        },
        references: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_references',
        },
        reference_details: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_reference_details',
        },
        transactions: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_transactions',
        },
        batches: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_batches',
        },
        business_partners: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_business_partners',
        },
        me: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_me',
        },
        menu: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_menu',
        },
        permissions: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_permissions',
        },
        approvals: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_approvals',
        },
        audit_logs: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_audit_logs',
        },
        incident_logs: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_incident_logs',
        },
        dealer_participants: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_dealer_participants',
        },
        groups: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_groups',
        },
        prices: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_prices',
        },
        api_users: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_api_users',
        },
        reporting: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_reporting',
        },
        egr: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_egr',
        },
        etf: {
            executor: 'constant-vus',
            vus: 1000,
            duration: '1m',
            exec: 'run_etf',
        },
    },
};

export function setup() {
    return { token: login() };
}

export function handleSummary(data) {
    const metrics = data.metrics;
    const now = new Date();
    const jakartaTime = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const localNow = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const timestamp = localNow.toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    const logPath = `logs/main_js_${timestamp}.txt`;

    const reportHeader = `\\n${'='.repeat(80)}\\n` +
        `FULL SYSTEM PERFORMANCE SUMMARY\\n` +
        `Target URL : ${baseUrl}\\n` +
        `Timestamp  : ${jakartaTime} (WIB)\\n` +
        `${'='.repeat(80)}\\n`;

    return {
        'stdout': reportHeader + textSummary(data, { indent: ' ', enableColors: true }),
        [logPath]: reportHeader + textSummary(data, { indent: ' ', enableColors: false }),
    };
}
export function run_app_info(data) {
    app_info_scenario(data.token);
    sleep(1);
}
export function run_master_config(data) {
    master_config_scenario(data.token);
    sleep(1);
}
export function run_system(data) {
    system_scenario(data.token);
    sleep(1);
}
export function run_nav(data) {
    nav_scenario(data.token);
    sleep(1);
}
export function run_auth(data) {
    auth_scenario(data.token);
    sleep(1);
}
export function run_sessions(data) {
    sessions_scenario(data.token);
    sleep(1);
}
export function run_notifications(data) {
    notifications_scenario(data.token);
    sleep(1);
}
export function run_users(data) {
    users_scenario(data.token);
    sleep(1);
}
export function run_roles(data) {
    roles_scenario(data.token);
    sleep(1);
}
export function run_organizations(data) {
    organizations_scenario(data.token);
    sleep(1);
}
export function run_references(data) {
    references_scenario(data.token);
    sleep(1);
}
export function run_reference_details(data) {
    reference_details_scenario(data.token);
    sleep(1);
}
export function run_transactions(data) {
    transactions_scenario(data.token);
    sleep(1);
}
export function run_batches(data) {
    batches_scenario(data.token);
    sleep(1);
}
export function run_business_partners(data) {
    business_partners_scenario(data.token);
    sleep(1);
}
export function run_me(data) {
    me_scenario(data.token);
    sleep(1);
}
export function run_menu(data) {
    menu_scenario(data.token);
    sleep(1);
}
export function run_permissions(data) {
    permissions_scenario(data.token);
    sleep(1);
}
export function run_approvals(data) {
    approvals_scenario(data.token);
    sleep(1);
}
export function run_audit_logs(data) {
    audit_logs_scenario(data.token);
    sleep(1);
}
export function run_incident_logs(data) {
    incident_logs_scenario(data.token);
    sleep(1);
}
export function run_dealer_participants(data) {
    dealer_participants_scenario(data.token);
    sleep(1);
}
export function run_groups(data) {
    groups_scenario(data.token);
    sleep(1);
}
export function run_prices(data) {
    prices_scenario(data.token);
    sleep(1);
}
export function run_api_users(data) {
    api_users_scenario(data.token);
    sleep(1);
}
export function run_reporting(data) {
    reporting_scenario(data.token);
    sleep(1);
}
export function run_egr(data) {
    egr_scenario(data.token);
    sleep(1);
}
export function run_etf(data) {
    etf_scenario(data.token);
    sleep(1);
}