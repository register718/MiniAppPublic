#!/bin/bash
adduser horst

sudo apt update
sudo apt -y upgrade
sudo apt install -y python3-pip python3-dev nginx curl python3-venv git libaugeas0


su horst
cd

# Key gen Git
ssh-keygen
echo Copy and add sshkey to git
cat cat ./.ssh/id_rsa.pub
read -p "Press Enter to continue" </dev/tty

git clone git@github.com:register718/MiniApp.git
# Virtual Env
python3 -m venv MiniAppEnv
source MiniAppEnv/bin/activate

# Richtiger Checkout
cd MiniApp
git checkout deploy

# Add pips 
pip install django daphne channels django_crontab djangorestframework django-crispy-forms crispy-bootstrap5 pyTelegramBotAPI reportlab
pip install -U "Twisted[tls,http2]"

deactivate
exit

## Wieder in ROOT Config Server

#DATEI
echo "[Unit]" >> /etc/systemd/system/change_run_owner.service
echo "Description=Change owner of /run folder" >> /etc/systemd/system/change_run_owner.service
echo "After=multi-user.target" >> /etc/systemd/system/change_run_owner.service
echo "" >> /etc/systemd/system/change_run_owner.service
echo "[Service]" >> /etc/systemd/system/change_run_owner.service
echo "Type=oneshot" >> /etc/systemd/system/change_run_owner.service
echo "ExecStart=chown horst:www-data /run/daphne" >> /etc/systemd/system/change_run_owner.service
echo "" >> /etc/systemd/system/change_run_owner.service
echo "[Install]" >> /etc/systemd/system/change_run_owner.service
echo "WantedBy=multi-user.targe" >> /etc/systemd/system/change_run_owner.service

systemctl start change_run_owner.service
systemctl enable change_run_owner.service

echo "[Unit]" >> /etc/systemd/system/daphne.socket
echo "Description=daphne socket" >> /etc/systemd/system/daphne.socket
echo "" >> /etc/systemd/system/daphne.socket
echo "[Socket]" >> /etc/systemd/system/daphne.socket
echo "ListenStream=/run/daphne/daphne.sock" >> /etc/systemd/system/daphne.socket
echo "" >> /etc/systemd/system/daphne.socket
echo "[Install]" >> /etc/systemd/system/daphne.socket
echo "WantedBy=sockets.target" >> /etc/systemd/system/daphne.socket

systemctl start daphne.socket
systemctl enable daphne.socket

echo "[Unit]" >> /etc/systemd/system/daphne.service
echo "Description=daphne daemon" >> /etc/systemd/system/daphne.service
echo "Requires=daphne.socket" >> /etc/systemd/system/daphne.service
echo "After=network.target" >> /etc/systemd/system/daphne.service
echo "" >> /etc/systemd/system/daphne.service
echo "[Service]" >> /etc/systemd/system/daphne.service
echo "User=horst" >> /etc/systemd/system/daphne.service
echo "Group=www-data" >> /etc/systemd/system/daphne.service
echo "WorkingDirectory=/home/horst/MiniApp/django" >> /etc/systemd/system/daphne.service
echo "ExecStart=/home/horst/MiniAppEnv/bin/daphne \" >> /etc/systemd/system/daphne.service
echo "          -u /run/daphne/daphne.sock \" >> /etc/systemd/system/daphne.service
echo "          MiniApp.asgi:application" >> /etc/systemd/system/daphne.service
echo "" >> /etc/systemd/system/daphne.service
echo "[Install]" >> /etc/systemd/system/daphne.service
echo "WantedBy=multi-user.targe" >> /etc/systemd/system/daphne.service

systemctl start daphne.service
systemctl enable daphne.service


echo "server {" >> /etc/nginx/sites-available/MiniApp
echo "    listen 80;" >> /etc/nginx/sites-available/MiniApp
echo "    server_name plan.minis-betzigau.de;" >> /etc/nginx/sites-available/MiniApp
echo "" >> /etc/nginx/sites-available/MiniApp
echo "    location = /favicon.ico { access_log off; log_not_found off; }" >> /etc/nginx/sites-available/MiniApp
echo "    location /static/ {" >> /etc/nginx/sites-available/MiniApp
echo "        root /home/horst/MiniApp/django/static;" >> /etc/nginx/sites-available/MiniApp
echo "    }" >> /etc/nginx/sites-available/MiniApp
echo "" >> /etc/nginx/sites-available/MiniApp
echo "location /ws/ {" >> /etc/nginx/sites-available/MiniApp
echo "                proxy_pass http://unix:/run/daphne/daphne.sock;" >> /etc/nginx/sites-available/MiniApp
echo "                proxy_http_version 1.1;" >> /etc/nginx/sites-available/MiniApp
echo "                proxy_set_header Upgrade $http_upgrade;" >> /etc/nginx/sites-available/MiniApp
echo "                proxy_set_header Connection "upgrade";" >> /etc/nginx/sites-available/MiniApp
echo "    }" >> /etc/nginx/sites-available/MiniApp
echo "" >> /etc/nginx/sites-available/MiniApp
echo "    location / {" >> /etc/nginx/sites-available/MiniApp
echo "        include proxy_params;" >> /etc/nginx/sites-available/MiniApp
echo "        proxy_pass http://unix:/run/daphne/daphne.sock;" >> /etc/nginx/sites-available/MiniApp
echo "    }" >> /etc/nginx/sites-available/MiniApp
echo "" >> /etc/nginx/sites-available/MiniApp

ln -s /etc/nginx/sites-available/MiniApp /etc/nginx/sites-enabled
nginx -t

# CERTBOT
python3 -m venv /opt/certbot/
/opt/certbot/bin/pip install --upgrade pip
/opt/certbot/bin/pip install certbot certbot-nginx
ln -s /opt/certbot/bin/certbot /usr/bin/certbot
certbot --nginx