import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

// Global setups for google cloud
const gcpConfig = new pulumi.Config('gcp');

function createServiceAccount(name: string): gcp.serviceaccount.Account {
  return new gcp.serviceaccount.Account(name, {
    accountId: `${name}-sa`,
    displayName: `${name} Service Account`,
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
  const secret = new gcp.secretmanager.Secret(secretName, {
    secretId: secretId,
    replication: {
      auto: {},
    },
  });
  new gcp.secretmanager.SecretVersion(`${name}-secret-version`, {
    secret: secret.id,
    secretData: key.privateKey.apply((key) =>
      Buffer.from(key, 'utf8').toString('base64')
    ),
  });
  return secret;
}

function addIamPolicyBindings(
  sa: gcp.serviceaccount.Account,
  roles: string[]
): void {
  roles.forEach((role, index) => {
    new gcp.projects.IAMMember(`sa-iam-binding-${index}`, {
      project: gcpConfig.require('project'),
      role: role,
      member: pulumi.interpolate`serviceAccount:${sa.email}`,
    });
  });
}

export function createServiceAccountKeyAndStoreSecret(
  name: string,
  roles: string[]
): {
  serviceAccount: gcp.serviceaccount.Account;
  accountKey: gcp.serviceaccount.Key;
} {
  const serviceAccount = createServiceAccount(name);
  addIamPolicyBindings(serviceAccount, roles);
  const accountKey = createServiceAccountKey(name, serviceAccount);
  createAndStoreAccountSecret(name, accountKey);
  return { serviceAccount, accountKey };
}
