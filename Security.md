# Security Policy

Thank you for taking the time to report a potential security vulnerability in Moodly. We take security seriously and appreciate responsible disclosure — this document explains the preferred reporting channel, what information to include, and how we handle reports.

## Reporting a Vulnerability

Preferred (private) reporting method:
- GitHub Security Advisories: https://github.com/Hillan007/Moodly-2.0.1/security/advisories/new

Alternative (public/backup) reporting:
- Email: victorhillan007@gmail.com  
  - If you send sensitive details by email, please encrypt them using our PGP key: (paste PGP key here)

Do NOT create public issues for security-sensitive reports. If you accidentally create a public issue, please notify us immediately (via the email above or by reopening a private GitHub security advisory).

## What to include in your report

Please include as much of the following information as you can:
- A short, descriptive title for the issue
- Affected version(s) or commit(s)/branch (e.g., v2.0.0, main at commit abc123)
- A clear description of the vulnerability and its impact (confidentiality, integrity, availability)
- Step-by-step reproduction steps, minimal PoC (proof-of-concept) code, and/or screenshots
- Environment details (OS, Python version, dependency versions)
- Any available logs or stack traces
- Suggested remediation or mitigation, if you have one
- Whether you are willing to be credited publicly (name, Twitter/GitHub handle) or wish to remain anonymous

If you need to share highly sensitive information (exploitation details, credentials, etc.), please encrypt with our PGP key and indicate which key/version you used.

## Supported Versions

We currently support:
- main branch and releases from v2.0.0 and later. (Replace this with the exact supported version matrix used by the project.)

If you are unsure whether your version is supported, include the commit hash or tag in your report.

## Our Response Process & Timelines

We strive to handle reports responsibly and timely:

- Acknowledgement: within 3 business days
- Initial triage: within 7 calendar days
- Remediation plan or patch: typically within 30 calendar days for high/critical issues; lower severity may take longer depending on complexity and testing needs
- Coordinated disclosure: we will coordinate with you on a disclosure timeline. If a fix cannot be made in a reasonable time, we will provide mitigation guidance and regular status updates.

Note: timelines may vary for complex issues or those requiring third-party fixes. If immediate public safety risk or active exploitation is reported, we will prioritize accordingly and may shorten timelines.

## Coordinated Disclosure

We prefer coordinated disclosure:
- Please give us a reasonable time (default: 90 days) to fix the issue before public disclosure.
- If there is active exploitation or legal/ethical obligations to disclose sooner, include that in your report and we will work with you to reach the safest outcome.
- We will not publicly disclose a vulnerability until a fix/mitigation has been merged or an agreed-upon timeline has passed.

## Credit and Safe Harbor

- We greatly appreciate security researchers and will credit them unless they request anonymity.
- Please follow safe-testing practices: do not access or exfiltrate data you are not authorized to access, and do not disrupt production systems. Test against local or test environments when possible.
- If your report involves user data or systems beyond the scope of this repository, we may coordinate disclosure with affected parties.

## CVE / Upstream / Third-party Dependencies

- If a vulnerability requires a CVE or coordination with upstream projects, we will handle assignment and coordination where appropriate.
- For issues in third-party dependencies, we may open security advisories with the dependency maintainers and publish guidance for impacted versions.

## After a Fix

- When a fix is available we will:
  - Publish a security advisory describing the issue, affected versions, and remediation steps (unless a different disclosure plan is agreed).
  - Credit the reporter (if requested)
  - Release a patched version and update documentation/changelogs

## Legal Safe Harbor

We aim to provide a safe environment for legitimate security research. Except as required by law, we will not pursue legal action against a researcher acting in good faith, following this policy, and avoiding privacy violations and system destruction.

## Contact & Alternatives

- Preferred: GitHub Security Advisory (https://github.com/Hillan007/Moodly-2.0.1/security/advisories/new)
- Email backup: security@hillan007.dev (replace with the actual contact)
- PGP key: (paste PGP key here if you have one)

---

Thank you for helping keep Moodly secure. If you have any questions about this policy, or want me to add it to the repository and open a PR, tell me how you'd like the contact/email/PGP key and the supported-version matrix to read and I'll take care of the rest.
