import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	async rewrites() {
		return [
			{
				source: "/api/proxy/:path*",
				destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: `${process.env.NEXT_PUBLIC_IMAGE_HOSTNAME}`,
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
