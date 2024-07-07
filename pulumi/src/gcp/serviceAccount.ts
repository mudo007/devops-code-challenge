import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

// Global setups for google cloud
const gcpConfig = new pulumi.Config('gcp');

// Secrets creation and storing depends on the secrets api
const secretsApi = new gcp.projects.Service('secretsApi', {
  service: 'secretmanager.googleapis.com',
});

// Wraps the process of creating a service account, bind policies,
// create and store secrets, in a structured way with a clear naming convention
export function createServiceAccountKeyAndStoreSecret(
  name: string,
  roles: string[]
): {
  serviceAccount: gcp.serviceaccount.Account;
  accountKey: gcp.serviceaccount.Key;
} {
  const serviceAccount = createServiceAccount(name);
  addIamPolicyBindings(name, serviceAccount, roles);
  const accountKey = createServiceAccountKey(name, serviceAccount);
  createAndStoreAccountSecret(name, accountKey);
  return { serviceAccount, accountKey };
}

// Helper functions below
function createServiceAccount(name: string): gcp.serviceaccount.Account {
  return new gcp.serviceaccount.Account(name, {
    accountId: `${name}-sa`,
    displayName: `${name} Service Account`,
  });
}

function addIamPolicyBindings(
  name: string,
  sa: gcp.serviceaccount.Account,
  roles: string[]
): void {
  roles.forEach((role, index) => {
    new gcp.projects.IAMMember(`${name}-iam-binding-${index}`, {
      project: gcpConfig.require('project'),
      role: role,
      member: pulumi.interpolate`serviceAccount:${sa.email}`,
    });
  });
}

function createServiceAccountKey(
  name: string,
  sa: gcp.serviceaccount.Account
): gcp.serviceaccount.Key {
  return new gcp.serviceaccount.Key(`${name}-key`, {
    serviceAccountId: sa.id,
  });
}

function createAndStoreAccountSecret(
  name: string,
  key: gcp.serviceaccount.Key
): gcp.secretmanager.Secret {
  const secretName = `${name}-secret`;
  const secretId = `${name}-secret-id`;
  const secret = new gcp.secretmanager.Secret(
    secretName,
    {
      secretId: secretId,
      replication: {
        auto: {},
      },
    },
    { dependsOn: secretsApi }
  );
  new gcp.secretmanager.SecretVersion(
    `${name}-secret-version`,
    {
      secret: secret.id,
      secretData: key.privateKey.apply((key) =>
        Buffer.from(key, 'base64').toString()
      ),
    },
    { dependsOn: secret }
  );
  return secret;
}
