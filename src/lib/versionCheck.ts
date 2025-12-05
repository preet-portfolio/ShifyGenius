import packageJson from '../../package.json';

const FRONTEND_VERSION = packageJson.version;
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface VersionInfo {
  version: string;
  name: string;
  deployment: {
    platform: string;
    timestamp: string;
    commitSha: string;
    branch: string;
  };
}

/**
 * Check if frontend and backend versions are in sync
 *
 * In our Vercel deployment, frontend and backend are ALWAYS in sync because:
 * - Both deploy together atomically
 * - Same git commit
 * - Same deployment
 * - No separate backend to get out of sync
 *
 * This check validates that guarantee and logs deployment info.
 */
export async function checkVersionSync(): Promise<{
  inSync: boolean;
  frontend: string;
  backend: string | null;
  deploymentInfo?: VersionInfo['deployment'];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/version`);

    if (!response.ok) {
      console.warn('⚠️ Could not check backend version');
      return {
        inSync: false,
        frontend: FRONTEND_VERSION,
        backend: null,
      };
    }

    const backendInfo: VersionInfo = await response.json();
    const inSync = FRONTEND_VERSION === backendInfo.version;

    if (inSync) {
      console.log(`✅ Version sync confirmed: v${FRONTEND_VERSION}`);
      console.log(`📦 Deployment:`, backendInfo.deployment);
    } else {
      console.error(`❌ VERSION MISMATCH!`);
      console.error(`  Frontend: v${FRONTEND_VERSION}`);
      console.error(`  Backend:  v${backendInfo.version}`);
      console.error(`  This should never happen with Vercel atomic deployments!`);
    }

    return {
      inSync,
      frontend: FRONTEND_VERSION,
      backend: backendInfo.version,
      deploymentInfo: backendInfo.deployment,
    };
  } catch (error) {
    console.warn('⚠️ Version check failed:', error);
    return {
      inSync: false,
      frontend: FRONTEND_VERSION,
      backend: null,
    };
  }
}

/**
 * Get current frontend version
 */
export function getFrontendVersion(): string {
  return FRONTEND_VERSION;
}

/**
 * Display version info in console
 */
export function logVersionInfo(): void {
  console.log(`%c ShiftGenius v${FRONTEND_VERSION} `, 'background: #0070f3; color: white; padding: 4px 8px; border-radius: 3px;');
  console.log('🚀 Deployed on Vercel with atomic frontend-backend sync');
}
