const hostname = window.location.hostname;
const subdomain = hostname.split('.8xrespond.com')[0];

export const environment = {
  production: true,
  DOMAIN_URL: `https://${subdomain}.8xrespond.com`,
  API_URL: `https://${subdomain}.8xrespond.com/respond-websocket-backend/public/api/v1`,
  socketUrl: 'wss://8xrespond.com:8443/app/8xmeb',
};
