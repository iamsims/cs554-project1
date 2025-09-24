# CS 554 Project 1 - EC2 REST Service: Pounds → Kilograms

A REST API service deployed on AWS EC2 that converts pounds to kilograms with proper error handling and service management.


## Deliverables Checklist 

- [x] Git repository (GitHub/GitLab) with source code, README, and a short DESIGN.md (1–2 pages)
- [x] README with setup steps (install, run, test), and curl examples.
- [x] Screenshot(s) of a successful request using curl: In screenshots.pdf
- [x] Public endpoint: https://simran-cs544hw.duckdns.org/convert
- [x] IP/DNS (include Security Group rule summary) – In screenshots.pdf, README.md and DESIGN.md


## Quick Demo

**Primary HTTPS Endpoint (Extra Credit):**
```bash
curl https://simran-cs544hw.duckdns.org/convert?lbs=150
```

**Alternative HTTP Access:**
```bash
curl http://3.88.99.234:8080/convert?lbs=150  # Direct Node.js access
```


## Install 


### Prerequisites
- AWS Account with EC2 access, security groups allowed as above 
- SSH key pair for EC2 instance
- Git for version control
- Domain name (DuckDNS used for this project)

#### Security Group Configuration
| Rule | Protocol | Port | Source | Purpose |
|------|----------|------|---------|---------|
| SSH | TCP | 22 | Administrator IP only | Server management |
| HTTP | TCP | 80 | 0.0.0.0/0 | Public API access & HTTPS redirect |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure public API access |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Direct Node.js access (testing) |


### 1. Clone Repository
```bash
git clone https://github.com/iamsims/cs554-project1.git
cd cs554-project1
```

### 2. Install Dependencies
```bash
sudo apt update
sudo apt install -y nodejs npm

# Install project dependencies
npm install
```
### 3. Deploy as service
```bash
# Copy service file
sudo cp p1.service /etc/systemd/system/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable --now p1

# Verify service is running
sudo systemctl status p1
```

### 5. NGINX Reverse Proxy Setup
```bash
# Configure NGINX
sudo cp nginx-config /etc/nginx/sites-available/cs554-project1
sudo ln -s /etc/nginx/sites-available/cs554-project1 /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```


### 6. SSL Certificate (Extra Credit)
Get a domain and add the EC2 public IP to the domain. The domain here is 

```bash
# Obtain Let's Encrypt certificate
sudo certbot --nginx -d simran-cs544hw.duckdns.org

# Verify auto-renewal
sudo certbot renew --dry-run
```


## Run 


### Public Endpoint Information 

- **URL**: `https://simran-cs544hw.duckdns.org/convert` or `http://3.88.99.234:8080/convert?lbs=150`
- **Method**: GET
- **Parameter**: `lbs` (number)




## Test

### Local
```bash
node server.js
# In another terminal:
curl http://localhost:8080/convert?lbs=150
```

### Test Cases

Run these curl commands to verify all functionality:

```bash

curl 'https://simran-cs544hw.duckdns.org/convert?lbs=0'
curl 'https://simran-cs544hw.duckdns.org/convert?lbs=150'
curl 'https://simran-cs544hw.duckdns.org/convert?lbs=0.1'

# 7. Health check
curl 'https://simran-cs544hw.duckdns.org/health'
```

### Error Cases
```bash
# Test Case 6: Missing parameter (400)
curl -w "\nStatus: %{http_code}\n" https://simran-cs544hw.duckdns.org/convert
# Expected: 400 Bad Request

# Test Case 7: Negative value (422)
curl -w "\nStatus: %{http_code}\n" https://simran-cs544hw.duckdns.org/convert?lbs=-5
# Expected: 422 Unprocessable Entity

# Test Case 8: Invalid input (400)
curl -w "\nStatus: %{http_code}\n" https://simran-cs544hw.duckdns.org/convert?lbs=abc
# Expected: 400 Bad Request

# Test Case 9: NaN handling (400)
curl -w "\nStatus: %{http_code}\n" https://simran-cs544hw.duckdns.org/convert?lbs=NaN
# Expected: 400 Bad Request
```


**Error Responses**:

| Status Code | Scenario | Example |
|-------------|----------|---------|
| 400 Bad Request | Missing parameter | `GET /convert` |
| 400 Bad Request | Invalid number | `GET /convert?lbs=abc` |
| 422 Unprocessable Entity | Negative value | `GET /convert?lbs=-5` |
| 422 Unprocessable Entity | Non-finite value | `GET /convert?lbs=Infinity` |

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Logging**: Morgan middleware
- **Process Management**: systemd
- **Cloud Platform**: AWS EC2 (t2.micro)
- **Operating System**: Ubuntu 22.04 LTS
- **Cost**: 0 (Free tier)


## Cleanup Instructions

### 1. Stop Services
```bash
sudo systemctl stop p1 nginx
sudo systemctl disable p1 nginx
sudo rm /etc/systemd/system/p1.service
sudo systemctl daemon-reload
```

### 2. Remove SSL Certificate
```bash
sudo certbot delete --cert-name simran-cs544hw.duckdns.org
```

### 3. AWS Resource Cleanup
1. **EC2 Console** → Instances → Select instance → Instance State → **Terminate**
2. **Security Groups** → Delete security group 
3. **Key Pairs** → Delete .pem used to access the instance
4. **EBS Volumes** → Delete any orphaned volumes

### 4. DNS Cleanup
- **DuckDNS**: Delete or disable `simran-cs544hw.duckdns.org` record

### Post-Cleanup Verification
- [ ] EC2 instance terminated
- [ ] No ongoing charges on AWS billing
- [ ] Security group deleted
- [ ] Domain record disabled
- [ ] Final cost: **$0.00**

## Author

**Simran KC**  
CS 454/554 - Cloud Computing  
University of Alabama in Huntsville  

## Repository

- **GitHub**: https://github.com/iamsims/cs554-project1
- **Live API**: https://simran-cs544hw.duckdns.org/convert

