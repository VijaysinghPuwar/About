/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>🛡️ vijaysinghpuwar</Text>
        </Section>
        <Hr style={divider} />
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use this code to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code expires shortly. Didn't request this? No action needed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '480px', margin: '0 auto' }
const header = { padding: '0 0 16px' }
const brandMark = {
  fontSize: '16px',
  fontWeight: 'bold' as const,
  color: '#0a0f1e',
  fontFamily: "'JetBrains Mono', Courier, monospace",
  margin: '0',
}
const divider = { borderColor: '#e2e8f0', margin: '0 0 24px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#0a0f1e',
  margin: '0 0 16px',
}
const text = {
  fontSize: '14px',
  color: '#475569',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeStyle = {
  fontFamily: "'JetBrains Mono', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#0080ff',
  letterSpacing: '4px',
  margin: '0 0 28px',
}
const footer = { fontSize: '12px', color: '#94a3b8', margin: '28px 0 0' }
