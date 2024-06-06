import('reflect-metadata');
export default (phase, { defaultConfig }) => {
  /**
   * @type {import('next').NextConfig}
   */
  let nextConfig = {
    ...defaultConfig,
    output: 'standalone',
    logging: {
      fetches: {
        fullUrl: true,
      }
    },
    compress: false,
    httpAgentOptions: {
      keepAlive: false,
    },
  };

  const k8sEnv = process.env.K8S_ENV || 'local';
  console.log(`[${phase}] env='${k8sEnv}'`);

  switch (k8sEnv) {
    case 'local': {
      nextConfig = {
        ...nextConfig,
        env: {
          NEXT_PUBLIC_SHAPLE_URL: 'http://shaple.local.shaple.io',
          NEXT_PUBLIC_SHAPLE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.GgzQrVUWAlI5UwMSCcjkOm7tDcjg8RmMBtOiSlOe9IM',
        },
      };
      break;
    }
    case 'dev': {
      nextConfig = {
        ...nextConfig,
        env: {
          NEXT_PUBLIC_SHAPLE_URL: 'https://dev-builder.shaple.io',
          NEXT_PUBLIC_SHAPLE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.GgzQrVUWAlI5UwMSCcjkOm7tDcjg8RmMBtOiSlOe9IM',
        },
      }
      break;
    }
    case 'prod': {
      nextConfig = {
        ...nextConfig,
        env: {
          NEXT_PUBLIC_SHAPLE_URL: 'https://builder.shaple.io',
          NEXT_PUBLIC_SHAPLE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.D3kCoaPgUgVVPR8f7_iEJMML7r8b_wYAcTaNKTXVKxg',
        },
      };
      break;
    }
  }

  return nextConfig;
};
