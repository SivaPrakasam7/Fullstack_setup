#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[+] $1${NC}"
}

# Check if script is run as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run this script as root or with sudo${NC}"
    exit 1
fi

# Prompt for domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain name cannot be empty${NC}"
    exit 1
fi

print_status "Updating and upgrading system packages"
apt update && apt upgrade -y

print_status "Installing Apache"
apt install apache2 -y
systemctl enable apache2
systemctl start apache2

print_status "Installing NVM and Node.js"
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
source ~/.bashrc
nvm install --lts

print_status "Installing PM2"
npm i -g pm2
ln -s /home/ubuntu/.nvm/versions/node/$(nvm current)/bin/node /usr/bin/node
ln -s /home/ubuntu/.nvm/versions/node/$(nvm current)/bin/npm /usr/bin/npm
ln -s /home/ubuntu/.nvm/versions/node/$(nvm current)/bin/pm2 /usr/bin/pm2

print_status "Setting up simple Node.js app"
mkdir -p node_app && cd node_app
npm init -y
npm install express
cat << 'EOF' > bundle.js
const express = require('express');
const app = express();
const port = 3006;

app.get('/', (req, res) => {
    res.send('Hello, World! This is a simple Node.js app.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
EOF

print_status "Setting up simple web app"
mkdir -p web && cd web
cat << 'EOF' > index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Web App</title>
    <style>
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
        }
        h1 {
            font-size: 48px;
            color: #333;
        }
    </style>
</head>
<body>
    <h1>APPNAME</h1>
</body>
</html>
EOF
cd ..

print_status "Starting PM2 processes"
pm2 serve web 3000 --name web --spa
pm2 start bundle.js --name backend
pm2 save
pm2 startup

print_status "Configuring Apache for proxy and SSL"
a2enmod proxy proxy_http proxy_wstunnel rewrite headers ssl

# Create Apache configuration file
cat << EOF > /etc/apache2/sites-available/$DOMAIN.conf
<IfModule mod_ssl.c>
# Disable version disclosure
ServerTokens Prod
ServerSignature Off

# Mozilla Guideline v5.4, Apache 2.4.41, OpenSSL 1.1.1d, intermediate configuration, no OCSP
SSLProtocol         all -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite      ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
SSLHonorCipherOrder off
SSLSessionTickets   off

<VirtualHost *:80>
    ServerName $DOMAIN
    Redirect permanent / https://$DOMAIN/
</VirtualHost>

<VirtualHost *:443>
    ServerName $DOMAIN

    # SSL configurations
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/$DOMAIN/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/$DOMAIN/privkey.pem

    # SSL Session Cache and Timeout
    SSLSessionCacheTimeout 600
    LimitRequestBody 524288000

    # Enable rewrite engine
    RewriteEngine On

    # Allow CORS for subdomains of $DOMAIN
    RewriteCond %{HTTP:Origin} ^https://$DOMAIN$ [NC]
    RewriteRule ^ - [E=CORS_ORIGIN:%{HTTP:Origin}]

    # Add CORS headers if the origin is valid
    Header always set Access-Control-Allow-Origin "%{CORS_ORIGIN}e" env=CORS_ORIGIN
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    Header always set Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization, X-Requested-With"

    # Stream support
    SetEnv no-gzip 1
    Timeout 300
    ProxyTimeout 300

    # Handle preflight (OPTIONS) requests
    <If "%{REQUEST_METHOD} == 'OPTIONS'">
        Header always set Access-Control-Max-Age "86400" env=CORS_ORIGIN
        Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, PATCH, DELETE" env=CORS_ORIGIN
        Header always set Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization, X-Requested-With" env=CORS_ORIGIN
        Header always set Access-Control-Allow-Credentials "true" env=CORS_ORIGIN
        RewriteRule ^ - [R=204,L]
    </If>

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Content-Security-Policy "default-src 'self'; font-src 'self'; frame-src *; frame-ancestors 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; media-src 'self' blob:; img-src 'self' data: blob:; connect-src 'self';"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Permissions-Policy "fullscreen=(self), geolocation=(self)"
    Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"

    ProxyPass /api/ http://localhost:3006/
    ProxyPassReverse /api/ http://localhost:3006/

    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined

</VirtualHost>
</IfModule>
EOF

a2ensite $DOMAIN.conf
a2dissite 000-default.conf
systemctl reload apache2

print_status "Installing and configuring Certbot for SSL"
apt install certbot python3-certbot-apache -y
certbot --apache -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
certbot renew --dry-run

print_status "Setup complete! Your web app should be accessible at https://$DOMAIN"
echo "Node.js backend is running on port 3006, managed by PM2."
echo "Frontend is running on port 3000, managed by PM2."
echo "Check PM2 status with: pm2 list"
echo "Check Apache status with: systemctl status apache2"
