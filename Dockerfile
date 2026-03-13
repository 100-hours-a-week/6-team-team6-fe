# ===== Stage 1: Dependencies =====
FROM node:20-alpine AS deps
WORKDIR /app

# glibc 호환성 레이어 (네이티브 모듈 지원)
RUN apk add --no-cache libc6-compat

# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 파일만 먼저 복사 (캐시 활용)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ===== Stage 2: Build =====
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# ============================================================
# [빌드 시점 환경변수] NEXT_PUBLIC_* 는 빌드 시 번들에 포함됨
# docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com ...
# ============================================================
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_IMAGE_HOSTNAME
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IMAGE_HOSTNAME=$NEXT_PUBLIC_IMAGE_HOSTNAME
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_FIREBASE_VAPID_KEY=$NEXT_PUBLIC_FIREBASE_VAPID_KEY

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 실행 (NEXT_PUBLIC_* 환경변수가 번들에 포함됨)
RUN pnpm build

# ===== Stage 3: Runtime =====
FROM node:20-alpine AS runner
WORKDIR /app

# ============================================================
# [런타임 환경변수] 서버 사이드에서만 사용되는 변수
# docker run -e NEXTAUTH_SECRET=xxx -e NEXTAUTH_URL=xxx ...
# ============================================================
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
# NEXTAUTH_SECRET, NEXTAUTH_URL, AUTH_TRUST_HOST는 docker run 시 주입

# glibc 호환성 레이어
RUN apk add --no-cache libc6-compat

# pnpm 활성화 (프로덕션 의존성 설치용)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# standalone 빌드 결과물 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 누락 의존성 해결 (next-auth 등)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 소유권 변경
RUN chown -R nextjs:nodejs /app

# Non-root 사용자로 전환
USER nextjs

EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["server.js"]