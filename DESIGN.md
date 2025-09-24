# Design Document - CS 454/554 Project 1

## System Architecture

### High-Level Architecture Diagram
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Internet  │───▶│ AWS Security    │───▶│ NGINX Reverse   │───▶│ Node.js REST    │
│   Clients   │    │ Group Firewall  │    │ Proxy + SSL     │    │ API Service     │
└─────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                            │                       │                       │
                   ┌─────────────────┐    ┌─────────────────┐   ┌─────────────────┐
                   │ Ports: 22,80,   │    │ •SSL Termination│   │ • Express.js    │
                   │ 443, 8080       │    │ •Load Balancing │   │ • Input Valid.  │
                   │ • SSH: Admin IP │    │ •Security Headers│  │ • Error Handle. │
                   │ • HTTP/S: Public│    │ •Request Logging│   │ • JSON Response │
                   └─────────────────┘    └─────────────────┘   └─────────────────┘
                                                   │
                                         ┌─────────────────┐
                                         │ systemd Service │
                                         │ • Auto-start    │
                                         │ • Auto-restart  │
                                         │ • Log rotation  │
                                         │ • Non-root exec │
                                         └─────────────────┘
```

### Request Flow
1. **Client Request** → HTTPS request to `simran-cs544hw.duckdns.org`
2. **DNS Resolution** → DuckDNS resolves to EC2 public IP (3.88.99.234)
3. **AWS Security Group** → Firewall allows HTTPS (443) traffic
4. **NGINX SSL Termination** → Decrypts HTTPS, validates certificate
5. **Reverse Proxy** → Forwards to Node.js on localhost:8080
6. **Express.js Processing** → Validates input, performs conversion
7. **JSON Response** → Returns structured data through reverse path

## Technology Stack Analysis

### Platform Selection: AWS EC2

**Chosen**: Ubuntu 24.04 LTS on t2.micro  
**Rationale**:
- **Cost-effective**: Free tier eligible for educational use
- **Reliability**: Enterprise-grade virtualization platform
- **Scalability**: Easy to upgrade instance types as needed
- **Security**: VPC isolation and Security Group firewall
- **Ecosystem**: Rich integration with other AWS services

### Application Runtime: Node.js + Express.js

**Chosen**: Node.js 18.19.1 with Express.js
**Rationale**:
- **Development Speed**: Minimal boilerplate for REST APIs
- **JSON Native**: Built-in JSON parsing and response handling
- **Middleware Ecosystem**: Rich library support (Morgan logging)
- **Asynchronous**: Non-blocking I/O suitable for API workloads
- **Industry Standard**: Widely used for microservices

### Reverse Proxy: NGINX

**Chosen**: NGINX 1.24.0  
**Rationale**:
- **Performance**: High-performance HTTP server and reverse proxy
- **SSL Termination**: Handles encryption/decryption efficiently
- **Security**: Built-in protection against common web attacks
- **Flexibility**: Easy configuration for routing, caching, load balancing
- **Industry Standard**: De facto standard for production deployments


## Security Architecture

### Network Security: Multi-Layer Defense

**AWS Security Group Configuration** :
```yaml
Inbound Rules:
  HTTPS (443):  Source: 0.0.0.0/0          # Primary secure access
                
  Custom TCP (8080): Source: 0.0.0.0/0     # Direct Node.js testing
                     
  SSH (22):     Source: My_public_ip   # Administrator IP only
                
  HTTP (80):    Source: 0.0.0.0/0          # Redirect to HTTPS

Outbound Rules:
  All Traffic:  Destination: 0.0.0.0/0     # Package updates, DNS, etc.
```

### SSL/TLS Implementation

**Certificate Authority**: Let's Encrypt  
**Implementation**: Automated via Certbot  

**Certificate Details**:
```
Subject: CN=simran-cs544hw.duckdns.org
Issuer: Let's Encrypt Authority X3
Valid: 90 days (auto-renewal configured)
```

### Input Validation and Error Handling

**Validation Strategy**:
```javascript
// Parameter existence check
if (req.query.lbs === undefined) → 400 Bad Request

// Type validation
if (Number.isNaN(lbs)) → 400 Bad Request

// Business logic validation  
if (!Number.isFinite(lbs) || lbs < 0) → 422 Unprocessable Entity
```

## Service Reliability and Management

### Process Management: systemd

**Reliability Features**:
- **Boot Persistence**: Service starts automatically after system reboot
- **Failure Recovery**: Automatic restart on application crashes
- **Resource Isolation**: Runs under dedicated user account
- **Logging Integration**: Outputs captured by systemd journal


## Cost Analysis and Optimization

### Current Cost Structure

**Total Monthly Cost**: $0.00 (within free tier limits)

### Cost Optimization Strategies

**Current Optimizations**:
- t2.micro instance (smallest available)
- No additional EBS volumes
- No Elastic IP (uses dynamic IP)
- Free DNS and SSL services


