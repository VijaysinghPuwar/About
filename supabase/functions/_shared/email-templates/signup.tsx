/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Verify your access — {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brandMark}>🛡️ {siteName}</Text>
        </Section>
        <Hr style={divider} />
        <Heading style={h1}>Verify your identity</Heading>
        <Text style={text}>
          Welcome aboard. You've initiated access to{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          .
        </Text>
        <Text style={text}>
          Confirm your email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) to complete enrollment:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm Access
        </Button>
        <Text style={footer}>
          Didn't request this? No action needed — this link expires shortly.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: '#0080ff', textDecoration: 'underline' }
const button = {
  backgroundColor: '#0080ff',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#94a3b8', margin: '28px 0 0' }
