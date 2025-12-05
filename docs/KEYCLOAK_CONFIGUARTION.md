# Keycloak Configuration for Backstage Integration

## Overview

This guide describes how to configure Keycloak to work with **Backstage.io** using the **KeycloakOrgEntityProvider** plugin.  
It ensures that Backstage can **sync users and groups** from Keycloak securely using a service account.

---

## 1. Prerequisites

- **Keycloak 24+** (Quarkus distribution, e.g., `quay.io/keycloak/keycloak:latest`)  
- Admin access to the Keycloak Admin UI  
- Backstage instance with `@backstage-community/plugin-catalog-backend-module-keycloak` installed  

---

## 2. Create Backstage Client in Keycloak

1. **Go to**: Keycloak Admin UI → **Clients** → **Create Client**  
2. **Client ID**: `backstage-client`  
3. **Client Protocol**: `openid-connect`  
4. **Root URL**: leave empty  
5. Click **Save**

---

## 3. Configure Client Settings

Go to **Clients → backstage-client → Settings**:

| Setting | Value | Notes |
|---------|-------|-------|
| Access Type | **Confidential** | Must be confidential to use client credentials grant |
| Service Accounts Enabled | **ON** | Required for Backstage to fetch users/groups |
| Client Authentication | **ON** | Needed to authenticate via client secret |
| Authorization Enabled | **OFF** | Optional; can remain off |

Click **Save**.

---

## 4. Assign Service Account Roles

1. Go to **Clients → backstage-client → Service Account Roles**  
2. From **Client Role** dropdown, select **realm-management**  
3. Assign these roles:
    - view-users
    - query-users
    - view-groups
    - query-groups
4. Click **Save**  

> These roles allow the Backstage service account to **read users and groups** from the realm.

---

## Step 4: Verify Client Credentials

Get an access token using `curl`:

```bash
curl -X POST http://localhost:8080/realms/backstage/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=backstage-client" \
  -d "client_secret=<YOUR_CLIENT_SECRET>"
```

Expected Response:

```json
{
  "access_token": "<ACCESS_TOKEN>",
  "expires_in": 300,
  "token_type": "Bearer",
  "scope": "profile email"
}
```

If successful, your client authentication is correct.

---

## Step 5: Test Keycloak Admin API Access

Use the access token to list users:

```base
curl -X GET "http://localhost:8080/admin/realms/backstage/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

- `Success`: Returns a JSON list of users
- `403 Forbidden`: Service account roles missing or incorrect — check Step 3

---

## Step 6: Backstage Configuration Example

In your `app-config.yaml`:

```yaml
catalog:
  providers:
    keycloakOrg:
      default:
        baseUrl: http://localhost:8080
        realm: backstage
        loginRealm: backstage
        clientId: backstage-client
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}
        schedule:
          frequency: { minutes: 5 }
          timeout: { minutes: 3 }

auth:
  providers:
    keycloak:
      development:
        metadataUrl: http://localhost:8080/realms/backstage/.well-known/openid-configuration
        clientId: backstage-client
        clientSecret: ${KEYCLOAK_CLIENT_SECRET}
        prompt: auto
```

Replace `${KEYCLOAK_CLIENT_SECRET}` with your client secret from Keycloak.

---

## Troubleshooting

| Error   | Cause | Solution |
|---------|-------|----------|
| `401 unauthorized_client` | Client is public or service account disabled | Set client to **confidential** and enable **service accounts** |
| `403 Forbidden` | Service account roles missing | Assign `view-users`, `query-users`, `view-groups`, `query-groups` in realm-management |
| No users appear in Backstage | Token or roles incorrect | Test token manually via `curl` and verify API access |

---

## References

- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/index.html)
- [Backstage OIDC Provider](https://backstage.io/docs/auth/oidc/)
- [Issues Reference](https://github.com/backstage/backstage/issues/27351)