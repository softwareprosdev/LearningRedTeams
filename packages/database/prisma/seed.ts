import { PrismaClient, Role, Difficulty, Category, LessonType, VideoStatus, LabSessionStatus, QuestionType, AchievementType, SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clear existing data (in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing data...');
    await prisma.userAchievement.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.userStats.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.challengeMitreMapping.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.labSession.deleteMany();
    await prisma.lab.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.video.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.module.deleteMany();
    await prisma.courseMitreMapping.deleteMany();
    await prisma.course.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.session.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    await prisma.mitreSubtechnique.deleteMany();
    await prisma.mitreTechnique.deleteMany();
    await prisma.mitreTactic.deleteMany();
  }

  // Create hashed password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@zerodayinstitute.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.SUPER_ADMIN,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@zerodayinstitute.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Instructor',
      role: Role.INSTRUCTOR,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.student@zerodayinstitute.com',
        passwordHash: hashedPassword,
        firstName: 'John',
        lastName: 'Student',
        role: Role.STUDENT,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.student@zerodayinstitute.com',
        passwordHash: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Student',
        role: Role.STUDENT,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike.student@zerodayinstitute.com',
        passwordHash: hashedPassword,
        firstName: 'Mike',
        lastName: 'Student',
        role: Role.STUDENT,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    }),
  ]);

  // Create demo user for login page
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      passwordHash: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: Role.STUDENT,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Create user stats for all users
  await Promise.all([
    prisma.userStats.create({
      data: {
        userId: admin.id,
        totalPoints: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
    }),
    prisma.userStats.create({
      data: {
        userId: instructor.id,
        totalPoints: 500,
        level: 5,
        currentStreak: 30,
        longestStreak: 45,
        coursesCompleted: 2,
        lessonsCompleted: 25,
        quizzesCompleted: 8,
        labsCompleted: 5,
        challengesCompleted: 12,
      },
    }),
    prisma.userStats.create({
      data: {
        userId: demoUser.id,
        totalPoints: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
    }),
    ...students.map((student, index) =>
      prisma.userStats.create({
        data: {
          userId: student.id,
          totalPoints: (index + 1) * 150,
          level: index + 2,
          currentStreak: (index + 1) * 3,
          longestStreak: (index + 1) * 5,
          coursesCompleted: index,
          lessonsCompleted: (index + 1) * 3,
          quizzesCompleted: index + 1,
          labsCompleted: index,
          challengesCompleted: index + 1,
        },
      })
    ),
  ]);

  // Create MITRE ATT&CK data - All 14 Enterprise Tactics
  console.log('🎯 Creating MITRE ATT&CK Framework data...');

  const tacticsData = [
    { id: 'TA0043', name: 'Reconnaissance', description: 'The adversary is trying to gather information they can use to plan future operations.' },
    { id: 'TA0042', name: 'Resource Development', description: 'The adversary is trying to establish resources they can use to support operations.' },
    { id: 'TA0001', name: 'Initial Access', description: 'The adversary is trying to get into your network.' },
    { id: 'TA0002', name: 'Execution', description: 'The adversary is trying to run malicious code.' },
    { id: 'TA0003', name: 'Persistence', description: 'The adversary is trying to maintain their foothold.' },
    { id: 'TA0004', name: 'Privilege Escalation', description: 'The adversary is trying to gain higher-level permissions.' },
    { id: 'TA0005', name: 'Defense Evasion', description: 'The adversary is trying to avoid being detected.' },
    { id: 'TA0006', name: 'Credential Access', description: 'The adversary is trying to steal account names and passwords.' },
    { id: 'TA0007', name: 'Discovery', description: 'The adversary is trying to figure out your environment.' },
    { id: 'TA0008', name: 'Lateral Movement', description: 'The adversary is trying to move through your environment.' },
    { id: 'TA0009', name: 'Collection', description: 'The adversary is trying to gather data of interest to their goal.' },
    { id: 'TA0011', name: 'Command and Control', description: 'The adversary is trying to communicate with compromised systems to control them.' },
    { id: 'TA0010', name: 'Exfiltration', description: 'The adversary is trying to steal data.' },
    { id: 'TA0040', name: 'Impact', description: 'The adversary is trying to manipulate, interrupt, or destroy your systems and data.' },
  ];

  const tactics = await Promise.all(
    tacticsData.map(tactic =>
      prisma.mitreTactic.create({
        data: {
          id: tactic.id,
          name: tactic.name,
          description: tactic.description,
          url: `https://attack.mitre.org/tactics/${tactic.id}/`,
        },
      })
    )
  );

  const techniquesData = [
    // Reconnaissance
    { id: 'T1595', name: 'Active Scanning', tacticId: 'TA0043', desc: 'Adversaries may execute active reconnaissance scans to gather information that can be used during targeting.' },
    { id: 'T1592', name: 'Gather Victim Host Information', tacticId: 'TA0043', desc: 'Adversaries may gather information about the victim\'s hosts that can be used during targeting.' },
    { id: 'T1589', name: 'Gather Victim Identity Information', tacticId: 'TA0043', desc: 'Adversaries may gather information about the victim\'s identity that can be used during targeting.' },
    { id: 'T1590', name: 'Gather Victim Network Information', tacticId: 'TA0043', desc: 'Adversaries may gather information about the victim\'s networks that can be used during targeting.' },
    { id: 'T1591', name: 'Gather Victim Org Information', tacticId: 'TA0043', desc: 'Adversaries may gather information about the victim\'s organization that can be used during targeting.' },
    { id: 'T1598', name: 'Phishing for Information', tacticId: 'TA0043', desc: 'Adversaries may send phishing messages to elicit sensitive information that can be used during targeting.' },
    { id: 'T1597', name: 'Search Closed Sources', tacticId: 'TA0043', desc: 'Adversaries may search and gather information about victims from closed sources that can be used during targeting.' },
    { id: 'T1596', name: 'Search Open Technical Databases', tacticId: 'TA0043', desc: 'Adversaries may search freely available technical databases for information about victims that can be used during targeting.' },
    { id: 'T1593', name: 'Search Open Websites/Domains', tacticId: 'TA0043', desc: 'Adversaries may search freely available websites and/or domains for information about victims that can be used during targeting.' },
    { id: 'T1594', name: 'Search Victim-Owned Websites', tacticId: 'TA0043', desc: 'Adversaries may search websites owned by the victim for information that can be used during targeting.' },
    // Resource Development
    { id: 'T1583', name: 'Acquire Infrastructure', tacticId: 'TA0042', desc: 'Adversaries may buy, lease, or rent infrastructure that can be used during targeting.' },
    { id: 'T1586', name: 'Compromise Accounts', tacticId: 'TA0042', desc: 'Adversaries may compromise accounts with services that can be used during targeting.' },
    { id: 'T1584', name: 'Compromise Infrastructure', tacticId: 'TA0042', desc: 'Adversaries may compromise third-party infrastructure that can be used during targeting.' },
    { id: 'T1587', name: 'Develop Capabilities', tacticId: 'TA0042', desc: 'Adversaries may build capabilities that can be used during targeting.' },
    { id: 'T1585', name: 'Establish Accounts', tacticId: 'TA0042', desc: 'Adversaries may create and cultivate accounts with services that can be used during targeting.' },
    { id: 'T1588', name: 'Obtain Capabilities', tacticId: 'TA0042', desc: 'Adversaries may buy and/or steal capabilities that can be used during targeting.' },
    { id: 'T1608', name: 'Stage Capabilities', tacticId: 'TA0042', desc: 'Adversaries may upload, install, or otherwise set up capabilities that can be used during targeting.' },
    // Initial Access
    { id: 'T1189', name: 'Drive-by Compromise', tacticId: 'TA0001', desc: 'Adversaries may gain access to a system through a user visiting a website over the normal course of browsing.' },
    { id: 'T1190', name: 'Exploit Public-Facing Application', tacticId: 'TA0001', desc: 'Adversaries may attempt to take advantage of a weakness in an Internet-facing computer or program using software, data, or commands in order to cause unintended or unanticipated behavior.' },
    { id: 'T1133', name: 'External Remote Services', tacticId: 'TA0001', desc: 'Adversaries may leverage external-facing remote services to initially access and/or persist within a network.' },
    { id: 'T1200', name: 'Hardware Additions', tacticId: 'TA0001', desc: 'Adversaries may introduce computer accessories, computers, or networking hardware into a system or network that can be used as a vector to gain access.' },
    { id: 'T1566', name: 'Phishing', tacticId: 'TA0001', desc: 'Adversaries may send phishing messages to gain access to victim systems.' },
    { id: 'T1091', name: 'Replication Through Removable Media', tacticId: 'TA0001', desc: 'Adversaries may move onto systems by copying malware to removable media and taking advantage of Autorun features when the media is inserted into a system and executes.' },
    { id: 'T1195', name: 'Supply Chain Compromise', tacticId: 'TA0001', desc: 'Adversaries may manipulate products or product delivery mechanisms prior to receipt by a final consumer for the purpose of data or system compromise.' },
    { id: 'T1199', name: 'Trusted Relationship', tacticId: 'TA0001', desc: 'Adversaries may breach or otherwise leverage organizations who have access to intended victims.' },
    { id: 'T1078', name: 'Valid Accounts', tacticId: 'TA0001', desc: 'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.' },
    // Execution
    { id: 'T1059', name: 'Command and Scripting Interpreter', tacticId: 'TA0002', desc: 'Adversaries may abuse command and script interpreters to execute commands, scripts, or binaries.' },
    { id: 'T1609', name: 'Container Administration Command', tacticId: 'TA0002', desc: 'Adversaries may abuse a container administration service to execute commands within a container.' },
    { id: 'T1610', name: 'Deploy Container', tacticId: 'TA0002', desc: 'Adversaries may deploy a container into an environment to facilitate execution or evade defenses.' },
    { id: 'T1203', name: 'Exploitation for Client Execution', tacticId: 'TA0002', desc: 'Adversaries may exploit software vulnerabilities in client applications to execute code.' },
    { id: 'T1559', name: 'Inter-Process Communication', tacticId: 'TA0002', desc: 'Adversaries may abuse inter-process communication (IPC) mechanisms for local code or command execution.' },
    { id: 'T1106', name: 'Native API', tacticId: 'TA0002', desc: 'Adversaries may interact with the native OS application programming interface (API) to execute behaviors.' },
    { id: 'T1053', name: 'Scheduled Task/Job', tacticId: 'TA0002', desc: 'Adversaries may abuse task scheduling functionality to facilitate initial or recurring execution of malicious code.' },
    { id: 'T1648', name: 'Serverless Execution', tacticId: 'TA0002', desc: 'Adversaries may abuse serverless computing, integration, and automation services to execute arbitrary code in cloud environments.' },
    { id: 'T1129', name: 'Shared Modules', tacticId: 'TA0002', desc: 'Adversaries may execute malicious payloads via loading shared modules.' },
    { id: 'T1072', name: 'Software Deployment Tools', tacticId: 'TA0002', desc: 'Adversaries may gain access to and use third-party software suites installed within an enterprise network to execute code.' },
    { id: 'T1204', name: 'User Execution', tacticId: 'TA0002', desc: 'An adversary may rely upon specific actions by a user in order to gain execution.' },
    { id: 'T1047', name: 'Windows Management Instrumentation', tacticId: 'TA0002', desc: 'Adversaries may abuse Windows Management Instrumentation (WMI) to execute malicious commands and payloads.' },
    // Persistence
    { id: 'T1098', name: 'Account Manipulation', tacticId: 'TA0003', desc: 'Adversaries may manipulate accounts to maintain access to victim systems.' },
    { id: 'T1197', name: 'BITS Jobs', tacticId: 'TA0003', desc: 'Adversaries may abuse BITS jobs to persistently execute or clean up after malicious payloads.' },
    { id: 'T1547', name: 'Boot or Logon Autostart Execution', tacticId: 'TA0003', desc: 'Adversaries may configure system settings to automatically execute a program during system boot or logon to maintain persistence or gain higher-level privileges on compromised systems.' },
    { id: 'T1037', name: 'Boot or Logon Initialization Scripts', tacticId: 'TA0003', desc: 'Adversaries may use scripts automatically executed at boot or logon initialization to establish persistence.' },
    { id: 'T1176', name: 'Browser Extensions', tacticId: 'TA0003', desc: 'Adversaries may abuse Internet browser extensions to establish persistent access to victim systems.' },
    { id: 'T1554', name: 'Compromise Client Software Binary', tacticId: 'TA0003', desc: 'Adversaries may modify client software binaries to establish persistent access to systems.' },
    { id: 'T1136', name: 'Create Account', tacticId: 'TA0003', desc: 'Adversaries may create an account to maintain access to victim systems.' },
    { id: 'T1543', name: 'Create or Modify System Process', tacticId: 'TA0003', desc: 'Adversaries may create or modify system-level processes to repeatedly execute malicious payloads as part of persistence.' },
    { id: 'T1546', name: 'Event Triggered Execution', tacticId: 'TA0003', desc: 'Adversaries may establish persistence and/or elevate privileges using system mechanisms that trigger execution based on specific events.' },
    { id: 'T1574', name: 'Hijack Execution Flow', tacticId: 'TA0003', desc: 'Adversaries may execute their own malicious payloads by hijacking the way operating systems run programs.' },
    // Privilege Escalation
    { id: 'T1134', name: 'Access Token Manipulation', tacticId: 'TA0004', desc: 'Adversaries may modify access tokens to operate under a different user or system security context to perform actions and bypass access controls.' },
    { id: 'T1548', name: 'Abuse Elevation Control Mechanism', tacticId: 'TA0004', desc: 'Adversaries may circumvent mechanisms designed to control elevate privileges to gain higher-level permissions.' },
    { id: 'T1068', name: 'Exploitation for Privilege Escalation', tacticId: 'TA0004', desc: 'Adversaries may exploit software vulnerabilities in an attempt to elevate privileges.' },
    { id: 'T1484', name: 'Domain Policy Modification', tacticId: 'TA0004', desc: 'Adversaries may modify the configuration settings of a domain to evade defenses and/or escalate privileges in domain environments.' },
    { id: 'T1611', name: 'Escape to Host', tacticId: 'TA0004', desc: 'Adversaries may break out of a container to gain access to the underlying host.' },
    { id: 'T1055', name: 'Process Injection', tacticId: 'TA0004', desc: 'Adversaries may inject code into processes in order to evade process-based defenses as well as possibly elevate privileges.' },
    { id: 'T1505', name: 'Server Software Component', tacticId: 'TA0004', desc: 'Adversaries may abuse legitimate extensible development features of servers to establish persistent access to systems.' },
    // Defense Evasion
    { id: 'T1140', name: 'Deobfuscate/Decode Files or Information', tacticId: 'TA0005', desc: 'Adversaries may use Obfuscated Files or Information to hide artifacts of an intrusion from analysis.' },
    { id: 'T1006', name: 'Direct Volume Access', tacticId: 'TA0005', desc: 'Adversaries may directly access a volume to bypass file access controls and file system monitoring.' },
    { id: 'T1480', name: 'Execution Guardrails', tacticId: 'TA0005', desc: 'Adversaries may use execution guardrails to constrain execution or actions based on adversary supplied and environment specific conditions that are expected to be present on the target.' },
    { id: 'T1211', name: 'Exploitation for Defense Evasion', tacticId: 'TA0005', desc: 'Adversaries may exploit a system or application vulnerability to bypass security features.' },
    { id: 'T1222', name: 'File and Directory Permissions Modification', tacticId: 'TA0005', desc: 'Adversaries may modify file or directory permissions/attributes to evade access control lists (ACLs) and access protected files.' },
    { id: 'T1564', name: 'Hide Artifacts', tacticId: 'TA0005', desc: 'Adversaries may attempt to hide artifacts associated with their behaviors to evade detection.' },
    { id: 'T1562', name: 'Impair Defenses', tacticId: 'TA0005', desc: 'Adversaries may maliciously modify components of a victim environment in order to hinder or disable defensive mechanisms.' },
    { id: 'T1070', name: 'Indicator Removal', tacticId: 'TA0005', desc: 'Adversaries may delete or alter generated artifacts on a host system, including logs or captured files such as quarantined malware.' },
    { id: 'T1202', name: 'Indirect Command Execution', tacticId: 'TA0005', desc: 'Adversaries may abuse utilities that allow for command execution to bypass security restrictions that limit the use of command-line interpreters.' },
    { id: 'T1036', name: 'Masquerading', tacticId: 'TA0005', desc: 'Adversaries may attempt to manipulate features of their artifacts to make them appear legitimate or benign to users and/or security tools.' },
    { id: 'T1556', name: 'Modify Authentication Process', tacticId: 'TA0005', desc: 'Adversaries may modify authentication mechanisms and processes to access user credentials or enable otherwise unwarranted access to accounts.' },
    { id: 'T1027', name: 'Obfuscated Files or Information', tacticId: 'TA0005', desc: 'Adversaries may attempt to make an executable or file difficult to discover or analyze by encrypting, encoding, or otherwise obfuscating its contents on the system or in transit.' },
    { id: 'T1542', name: 'Pre-OS Boot', tacticId: 'TA0005', desc: 'Adversaries may abuse Pre-OS Boot mechanisms as a way to establish persistence on a system.' },
    { id: 'T1601', name: 'Modify System Image', tacticId: 'TA0005', desc: 'Adversaries may make changes to the operating system of embedded network devices to weaken defenses and provide new capabilities for themselves.' },
    { id: 'T1620', name: 'Reflective Code Loading', tacticId: 'TA0005', desc: 'Adversaries may reflectively load code into a process in order to conceal the execution of malicious payloads.' },
    // Credential Access
    { id: 'T1110', name: 'Brute Force', tacticId: 'TA0006', desc: 'Adversaries may use brute force techniques to gain access to accounts when passwords are unknown or when password hashes are obtained.' },
    { id: 'T1555', name: 'Credentials from Password Stores', tacticId: 'TA0006', desc: 'Adversaries may search for common password storage locations to obtain user credentials.' },
    { id: 'T1212', name: 'Exploitation for Credential Access', tacticId: 'TA0006', desc: 'Adversaries may exploit software vulnerabilities in an attempt to collect credentials.' },
    { id: 'T1187', name: 'Forced Authentication', tacticId: 'TA0006', desc: 'Adversaries may gather credential material by invoking or forcing a user to automatically provide authentication information through a mechanism in which they can intercept.' },
    { id: 'T1056', name: 'Input Capture', tacticId: 'TA0006', desc: 'Adversaries may use methods of capturing user input to obtain credentials or collect information.' },
    { id: 'T1111', name: 'Multi-Factor Authentication Interception', tacticId: 'TA0006', desc: 'Adversaries may target multi-factor authentication (MFA) mechanisms to gain access to credentials that can be used to access systems, services, and network resources.' },
    { id: 'T1621', name: 'Multi-Factor Authentication Request Generation', tacticId: 'TA0006', desc: 'Adversaries may attempt to bypass multi-factor authentication (MFA) mechanisms and gain access to accounts by generating MFA requests sent to users.' },
    { id: 'T1040', name: 'Network Sniffing', tacticId: 'TA0006', desc: 'Adversaries may sniff network traffic to capture information about an environment, including authentication material passed over the network.' },
    { id: 'T1003', name: 'OS Credential Dumping', tacticId: 'TA0006', desc: 'Adversaries may attempt to dump credentials to obtain account login and credential material, normally in the form of a hash or a clear text password, from the operating system and software.' },
    { id: 'T1528', name: 'Steal Application Access Token', tacticId: 'TA0006', desc: 'Adversaries can steal application access tokens as a means of acquiring credentials to access remote systems and resources.' },
    { id: 'T1649', name: 'Steal or Forge Authentication Certificates', tacticId: 'TA0006', desc: 'Adversaries may steal or forge certificates used for authentication to access remote systems or resources.' },
    { id: 'T1558', name: 'Steal or Forge Kerberos Tickets', tacticId: 'TA0006', desc: 'Adversaries may attempt to subvert Kerberos authentication by stealing or forging Kerberos tickets to enable Pass the Ticket.' },
    { id: 'T1539', name: 'Steal Web Session Cookie', tacticId: 'TA0006', desc: 'An adversary may steal web application or service session cookies and use them to gain access to web applications or Internet services as an authenticated user without needing credentials.' },
    { id: 'T1552', name: 'Unsecured Credentials', tacticId: 'TA0006', desc: 'Adversaries may search compromised systems to find and obtain insecurely stored credentials.' },
    // Discovery
    { id: 'T1087', name: 'Account Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to get a listing of accounts on a system or within an environment.' },
    { id: 'T1010', name: 'Application Window Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to get a listing of open application windows.' },
    { id: 'T1217', name: 'Browser Information Discovery', tacticId: 'TA0007', desc: 'Adversaries may enumerate information about browsers to learn more about compromised environments.' },
    { id: 'T1580', name: 'Cloud Infrastructure Discovery', tacticId: 'TA0007', desc: 'An adversary may attempt to discover infrastructure and resources that are available within an infrastructure-as-a-service (IaaS) environment.' },
    { id: 'T1538', name: 'Cloud Service Dashboard', tacticId: 'TA0007', desc: 'An adversary may use a cloud service dashboard GUI with stolen credentials to gain useful information from an operational cloud environment.' },
    { id: 'T1526', name: 'Cloud Service Discovery', tacticId: 'TA0007', desc: 'An adversary may attempt to enumerate the cloud services running on a system after gaining access.' },
    { id: 'T1613', name: 'Container and Resource Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to discover containers and other resources that are available within a containers environment.' },
    { id: 'T1622', name: 'Debugger Evasion', tacticId: 'TA0007', desc: 'Adversaries may employ various means to detect and avoid debuggers.' },
    { id: 'T1083', name: 'File and Directory Discovery', tacticId: 'TA0007', desc: 'Adversaries may enumerate files and directories or may search in specific locations of a host or network share for certain information within a file system.' },
    { id: 'T1046', name: 'Network Service Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to get a listing of services running on remote hosts and local network infrastructure devices.' },
    { id: 'T1135', name: 'Network Share Discovery', tacticId: 'TA0007', desc: 'Adversaries may look for folders and drives shared on remote systems as a means of identifying sources of information to gather as a precursor for Collection.' },
    { id: 'T1201', name: 'Password Policy Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to access detailed information about the password policy used within an enterprise network or cloud environment.' },
    { id: 'T1120', name: 'Peripheral Device Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to gather information about attached peripheral devices and components connected to a computer system.' },
    { id: 'T1069', name: 'Permission Groups Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to find group and permission settings.' },
    { id: 'T1057', name: 'Process Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to get information about running processes on a system.' },
    { id: 'T1012', name: 'Query Registry', tacticId: 'TA0007', desc: 'Adversaries may interact with the Windows Registry to gather information about the system, configuration, and installed software.' },
    { id: 'T1018', name: 'Remote System Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to get a listing of other systems by IP address, hostname, or other logical identifier on a network.' },
    { id: 'T1518', name: 'Software Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to get a listing of software and software versions that are installed on a system or in a cloud environment.' },
    { id: 'T1082', name: 'System Information Discovery', tacticId: 'TA0007', desc: 'An adversary may attempt to get detailed information about the operating system and hardware, including version, patches, hotfixes, service packs, and architecture.' },
    { id: 'T1614', name: 'System Location Discovery', tacticId: 'TA0007', desc: 'Adversaries may gather information in an attempt to calculate the geographical location of a victim host.' },
    { id: 'T1016', name: 'System Network Configuration Discovery', tacticId: 'TA0007', desc: 'Adversaries may look for details about the network configuration and settings of systems they access or through information discovery of remote systems.' },
    { id: 'T1049', name: 'System Network Connections Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to get a listing of network connections to or from the compromised system they are currently accessing.' },
    { id: 'T1033', name: 'System Owner/User Discovery', tacticId: 'TA0007', desc: 'Adversaries may attempt to identify the primary user, currently logged in user, set of users that commonly uses a system.' },
    { id: 'T1007', name: 'System Service Discovery', tacticId: 'TA0007', desc: 'Adversaries may try to gather information about registered local system services.' },
    { id: 'T1124', name: 'System Time Discovery', tacticId: 'TA0007', desc: 'An adversary may gather the system time and/or time zone from a local or remote system.' },
    { id: 'T1497', name: 'Virtualization/Sandbox Evasion', tacticId: 'TA0007', desc: 'Adversaries may employ various means to detect and avoid virtualization and analysis environments.' },
    // Lateral Movement
    { id: 'T1210', name: 'Exploitation of Remote Services', tacticId: 'TA0008', desc: 'Adversaries may exploit remote services to gain unauthorized access to internal systems once inside of a network.' },
    { id: 'T1534', name: 'Internal Spearphishing', tacticId: 'TA0008', desc: 'Adversaries may use internal spearphishing to gain access to additional information or exploit other users within the same organization.' },
    { id: 'T1570', name: 'Lateral Tool Transfer', tacticId: 'TA0008', desc: 'Adversaries may transfer tools or other files between systems in a compromised environment.' },
    { id: 'T1563', name: 'Remote Service Session Hijacking', tacticId: 'TA0008', desc: 'Adversaries may take control of preexisting sessions with remote services to move laterally in an environment.' },
    { id: 'T1021', name: 'Remote Services', tacticId: 'TA0008', desc: 'Adversaries may use Valid Accounts to log into a service specifically designed to accept remote connections, such as telnet, SSH, and VNC.' },
    { id: 'T1080', name: 'Taint Shared Content', tacticId: 'TA0008', desc: 'Adversaries may deliver payloads to remote systems by adding content to shared storage locations, such as network drives or internal code repositories.' },
    { id: 'T1550', name: 'Use Alternate Authentication Material', tacticId: 'TA0008', desc: 'Adversaries may use alternate authentication material, such as password hashes, Kerberos tickets, and application access tokens, in order to move laterally within an environment.' },
    // Collection
    { id: 'T1557', name: 'Adversary-in-the-Middle', tacticId: 'TA0009', desc: 'Adversaries may attempt to position themselves between two or more networked devices using an adversary-in-the-middle (AiTM) technique.' },
    { id: 'T1123', name: 'Audio Capture', tacticId: 'TA0009', desc: 'An adversary can leverage a computer\'s peripheral devices or applications to capture audio recordings for the purpose of listening into sensitive conversations.' },
    { id: 'T1119', name: 'Automated Collection', tacticId: 'TA0009', desc: 'Once established within a system or network, an adversary may use automated techniques for collecting internal data.' },
    { id: 'T1185', name: 'Browser Session Hijacking', tacticId: 'TA0009', desc: 'Adversaries may take advantage of security vulnerabilities and inherent functionality in browser software to change content, modify user-behaviors, and intercept information.' },
    { id: 'T1115', name: 'Clipboard Data', tacticId: 'TA0009', desc: 'Adversaries may collect data stored in the clipboard from users copying information within or between applications.' },
    { id: 'T1530', name: 'Data from Cloud Storage', tacticId: 'TA0009', desc: 'Adversaries may access data from cloud storage.' },
    { id: 'T1602', name: 'Data from Configuration Repository', tacticId: 'TA0009', desc: 'Adversaries may collect data related to managed devices from configuration repositories.' },
    { id: 'T1213', name: 'Data from Information Repositories', tacticId: 'TA0009', desc: 'Adversaries may leverage information repositories to mine valuable information.' },
    { id: 'T1005', name: 'Data from Local System', tacticId: 'TA0009', desc: 'Adversaries may search local system sources, such as file systems and configuration files or local databases, to find files of interest and sensitive data prior to Exfiltration.' },
    { id: 'T1039', name: 'Data from Network Shared Drive', tacticId: 'TA0009', desc: 'Adversaries may search network shares on computers they have compromised to find files of interest.' },
    { id: 'T1025', name: 'Data from Removable Media', tacticId: 'TA0009', desc: 'Adversaries may search connected removable media on computers they have compromised to find files of interest.' },
    { id: 'T1074', name: 'Data Staged', tacticId: 'TA0009', desc: 'Adversaries may stage collected data in a central location or directory prior to Exfiltration.' },
    { id: 'T1114', name: 'Email Collection', tacticId: 'TA0009', desc: 'Adversaries may target user email to collect sensitive information.' },
    { id: 'T1113', name: 'Screen Capture', tacticId: 'TA0009', desc: 'Adversaries may attempt to take screen captures of the desktop to gather information over the course of an operation.' },
    { id: 'T1125', name: 'Video Capture', tacticId: 'TA0009', desc: 'An adversary can leverage a computer\'s peripheral devices or applications to capture video recordings for the purpose of gathering information.' },
    // Command and Control
    { id: 'T1071', name: 'Application Layer Protocol', tacticId: 'TA0011', desc: 'Adversaries may communicate using OSI application layer protocols to avoid detection/network filtering by blending in with existing traffic.' },
    { id: 'T1092', name: 'Communication Through Removable Media', tacticId: 'TA0011', desc: 'Adversaries can perform command and control between compromised hosts on potentially disconnected networks using removable media to transfer commands from system to system.' },
    { id: 'T1132', name: 'Data Encoding', tacticId: 'TA0011', desc: 'Adversaries may encode data to make the content of command and control traffic more difficult to detect.' },
    { id: 'T1001', name: 'Data Obfuscation', tacticId: 'TA0011', desc: 'Adversaries may obfuscate command and control traffic to make it more difficult to detect.' },
    { id: 'T1568', name: 'Dynamic Resolution', tacticId: 'TA0011', desc: 'Adversaries may dynamically establish connections to command and control infrastructure to evade common detections and remediations.' },
    { id: 'T1573', name: 'Encrypted Channel', tacticId: 'TA0011', desc: 'Adversaries may employ a known encryption algorithm to conceal command and control traffic rather than relying on any inherent protections provided by a communication protocol.' },
    { id: 'T1008', name: 'Fallback Channels', tacticId: 'TA0011', desc: 'Adversaries may use fallback or alternate communication channels if the primary channel is compromised or inaccessible.' },
    { id: 'T1105', name: 'Ingress Tool Transfer', tacticId: 'TA0011', desc: 'Adversaries may transfer tools or other files from an external system into a compromised environment.' },
    { id: 'T1104', name: 'Multi-Stage Channels', tacticId: 'TA0011', desc: 'Adversaries may create multiple stages for command and control that are employed under different conditions or for certain functions.' },
    { id: 'T1095', name: 'Non-Application Layer Protocol', tacticId: 'TA0011', desc: 'Adversaries may use an OSI non-application layer protocol for communication between host and C2 server or among infected hosts within a network.' },
    { id: 'T1571', name: 'Non-Standard Port', tacticId: 'TA0011', desc: 'Adversaries may communicate using a protocol and port pairing that are typically not associated.' },
    { id: 'T1572', name: 'Protocol Tunneling', tacticId: 'TA0011', desc: 'Adversaries may tunnel network communications to and from a victim system within a separate protocol to avoid detection/network filtering.' },
    { id: 'T1090', name: 'Proxy', tacticId: 'TA0011', desc: 'Adversaries may use a connection proxy to direct network traffic between systems or act as an intermediary for network communications.' },
    { id: 'T1219', name: 'Remote Access Software', tacticId: 'TA0011', desc: 'An adversary may use legitimate desktop support and remote access software to establish an interactive command and control channel to target systems within networks.' },
    { id: 'T1205', name: 'Traffic Signaling', tacticId: 'TA0011', desc: 'Adversaries may use traffic signaling to hide open ports or other malicious functionality used for persistence or command and control.' },
    { id: 'T1102', name: 'Web Service', tacticId: 'TA0011', desc: 'Adversaries may use an existing, legitimate external Web service as a means for relaying data to/from a compromised system.' },
    // Exfiltration
    { id: 'T1020', name: 'Automated Exfiltration', tacticId: 'TA0010', desc: 'Adversaries may exfiltrate data, such as sensitive documents, through the use of automated processing after being gathered during Collection.' },
    { id: 'T1030', name: 'Data Transfer Size Limits', tacticId: 'TA0010', desc: 'An adversary may exfiltrate data in fixed size chunks instead of whole files or limit packet sizes below certain thresholds.' },
    { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', tacticId: 'TA0010', desc: 'Adversaries may steal data by exfiltrating it over a different protocol than that of the existing command and control channel.' },
    { id: 'T1041', name: 'Exfiltration Over C2 Channel', tacticId: 'TA0010', desc: 'Adversaries may steal data by exfiltrating it over an existing command and control channel.' },
    { id: 'T1011', name: 'Exfiltration Over Other Network Medium', tacticId: 'TA0010', desc: 'Adversaries may attempt to exfiltrate data over a different network medium than the command and control channel.' },
    { id: 'T1052', name: 'Exfiltration Over Physical Medium', tacticId: 'TA0010', desc: 'Adversaries may attempt to exfiltrate data via a physical medium, such as a removable drive.' },
    { id: 'T1567', name: 'Exfiltration Over Web Service', tacticId: 'TA0010', desc: 'Adversaries may use an existing, legitimate external Web service to exfiltrate data rather than their primary command and control channel.' },
    { id: 'T1029', name: 'Scheduled Transfer', tacticId: 'TA0010', desc: 'Adversaries may schedule data exfiltration to be performed only at certain times of day or at certain intervals.' },
    { id: 'T1537', name: 'Transfer Data to Cloud Account', tacticId: 'TA0010', desc: 'Adversaries may exfiltrate data by transferring the data to another cloud account they control on the same service.' },
    // Impact
    { id: 'T1531', name: 'Account Access Removal', tacticId: 'TA0040', desc: 'Adversaries may interrupt availability of system and network resources by inhibiting access to accounts utilized by legitimate users.' },
    { id: 'T1485', name: 'Data Destruction', tacticId: 'TA0040', desc: 'Adversaries may destroy data and files on specific systems or in large numbers on a network to interrupt availability to systems, services, and network resources.' },
    { id: 'T1486', name: 'Data Encrypted for Impact', tacticId: 'TA0040', desc: 'Adversaries may encrypt data on target systems or on large numbers of systems in a network to interrupt availability to system and network resources.' },
    { id: 'T1565', name: 'Data Manipulation', tacticId: 'TA0040', desc: 'Adversaries may insert, delete, or manipulate data in order to influence external outcomes or hide activity, thus threatening the integrity of the data.' },
    { id: 'T1491', name: 'Defacement', tacticId: 'TA0040', desc: 'Adversaries may modify visual content available internally or externally to an enterprise network, thus affecting the integrity of the original content.' },
    { id: 'T1561', name: 'Disk Wipe', tacticId: 'TA0040', desc: 'Adversaries may wipe or corrupt raw disk data on specific systems or in large numbers in a network to interrupt availability to system and network resources.' },
    { id: 'T1499', name: 'Endpoint Denial of Service', tacticId: 'TA0040', desc: 'Adversaries may perform Endpoint Denial of Service (DoS) attacks to degrade or block the availability of services to users.' },
    { id: 'T1495', name: 'Firmware Corruption', tacticId: 'TA0040', desc: 'Adversaries may overwrite or corrupt the flash memory contents of system BIOS or other firmware in devices attached to a system.' },
    { id: 'T1490', name: 'Inhibit System Recovery', tacticId: 'TA0040', desc: 'Adversaries may delete or remove built-in data and turn off services designed to aid in the recovery of a corrupted system to prevent recovery.' },
    { id: 'T1498', name: 'Network Denial of Service', tacticId: 'TA0040', desc: 'Adversaries may perform Network Denial of Service (DoS) attacks to degrade or block the availability of targeted resources to users.' },
    { id: 'T1496', name: 'Resource Hijacking', tacticId: 'TA0040', desc: 'Adversaries may leverage the resources of co-opted systems in order to solve resource intensive problems, which may impact system and/or hosted service availability.' },
    { id: 'T1489', name: 'Service Stop', tacticId: 'TA0040', desc: 'Adversaries may stop or disable services on a system to render those services unavailable to legitimate users.' },
    { id: 'T1529', name: 'System Shutdown/Reboot', tacticId: 'TA0040', desc: 'Adversaries may shutdown/reboot systems to interrupt access to, or aid in the destruction of, those systems.' },
  ];

  const techniques = await Promise.all(
    techniquesData.map(tech =>
      prisma.mitreTechnique.create({
        data: {
          id: tech.id,
          name: tech.name,
          description: tech.desc,
          url: `https://attack.mitre.org/techniques/${tech.id}/`,
          tacticId: tech.tacticId,
        },
      })
    )
  );

  const subtechniquesData = [
    // Phishing subtechniques
    { id: 'T1566.001', name: 'Spearphishing Attachment', techniqueId: 'T1566', desc: 'Adversaries may send spearphishing emails with a malicious attachment in an attempt to gain access to victim systems.' },
    { id: 'T1566.002', name: 'Spearphishing Link', techniqueId: 'T1566', desc: 'Adversaries may send spearphishing emails with a malicious link in an attempt to gain access to victim systems.' },
    { id: 'T1566.003', name: 'Spearphishing via Service', techniqueId: 'T1566', desc: 'Adversaries may send spearphishing messages via third-party services in an attempt to gain access to victim systems.' },
    // Command and Scripting Interpreter
    { id: 'T1059.001', name: 'PowerShell', techniqueId: 'T1059', desc: 'Adversaries may abuse PowerShell commands and scripts for execution.' },
    { id: 'T1059.002', name: 'AppleScript', techniqueId: 'T1059', desc: 'Adversaries may abuse AppleScript for execution.' },
    { id: 'T1059.003', name: 'Windows Command Shell', techniqueId: 'T1059', desc: 'Adversaries may abuse the Windows command shell for execution.' },
    { id: 'T1059.004', name: 'Unix Shell', techniqueId: 'T1059', desc: 'Adversaries may abuse Unix shell commands and scripts for execution.' },
    { id: 'T1059.005', name: 'Visual Basic', techniqueId: 'T1059', desc: 'Adversaries may abuse Visual Basic (VB) for execution.' },
    { id: 'T1059.006', name: 'Python', techniqueId: 'T1059', desc: 'Adversaries may abuse Python commands and scripts for execution.' },
    { id: 'T1059.007', name: 'JavaScript', techniqueId: 'T1059', desc: 'Adversaries may abuse various implementations of JavaScript for execution.' },
    { id: 'T1059.008', name: 'Network Device CLI', techniqueId: 'T1059', desc: 'Adversaries may abuse scripting or built-in command line interpreters on network devices to execute malicious command and payloads.' },
    // OS Credential Dumping
    { id: 'T1003.001', name: 'LSASS Memory', techniqueId: 'T1003', desc: 'Adversaries may attempt to access credential material stored in the process memory of the Local Security Authority Subsystem Service (LSASS).' },
    { id: 'T1003.002', name: 'Security Account Manager', techniqueId: 'T1003', desc: 'Adversaries may attempt to extract credential material from the Security Account Manager (SAM) database.' },
    { id: 'T1003.003', name: 'NTDS', techniqueId: 'T1003', desc: 'Adversaries may attempt to access or create a copy of the Active Directory domain database in order to steal credential information.' },
    { id: 'T1003.004', name: 'LSA Secrets', techniqueId: 'T1003', desc: 'Adversaries with SYSTEM access to a host may attempt to access Local Security Authority (LSA) secrets.' },
    { id: 'T1003.005', name: 'Cached Domain Credentials', techniqueId: 'T1003', desc: 'Adversaries may attempt to access cached domain credentials used to allow authentication to occur in the event a domain controller is unavailable.' },
    { id: 'T1003.006', name: 'DCSync', techniqueId: 'T1003', desc: 'Adversaries may attempt to access credentials and other sensitive information by abusing a Windows Domain Controller\'s API to simulate the replication process.' },
    { id: 'T1003.007', name: 'Proc Filesystem', techniqueId: 'T1003', desc: 'Adversaries may gather credentials from the proc filesystem or /proc.' },
    { id: 'T1003.008', name: '/etc/passwd and /etc/shadow', techniqueId: 'T1003', desc: 'Adversaries may attempt to dump the contents of /etc/passwd and /etc/shadow to enable offline password cracking.' },
    // Valid Accounts
    { id: 'T1078.001', name: 'Default Accounts', techniqueId: 'T1078', desc: 'Adversaries may obtain and abuse credentials of a default account as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.' },
    { id: 'T1078.002', name: 'Domain Accounts', techniqueId: 'T1078', desc: 'Adversaries may obtain and abuse credentials of a domain account as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.' },
    { id: 'T1078.003', name: 'Local Accounts', techniqueId: 'T1078', desc: 'Adversaries may obtain and abuse credentials of a local account as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.' },
    { id: 'T1078.004', name: 'Cloud Accounts', techniqueId: 'T1078', desc: 'Adversaries may obtain and abuse credentials of a cloud account as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion.' },
    // Scheduled Task/Job
    { id: 'T1053.002', name: 'At', techniqueId: 'T1053', desc: 'Adversaries may abuse the at utility to perform task scheduling for initial or recurring execution of malicious code.' },
    { id: 'T1053.003', name: 'Cron', techniqueId: 'T1053', desc: 'Adversaries may abuse the cron utility to perform task scheduling for initial or recurring execution of malicious code.' },
    { id: 'T1053.005', name: 'Scheduled Task', techniqueId: 'T1053', desc: 'Adversaries may abuse the Windows Task Scheduler to perform task scheduling for initial or recurring execution of malicious code.' },
    { id: 'T1053.006', name: 'Systemd Timers', techniqueId: 'T1053', desc: 'Adversaries may abuse systemd timers to perform task scheduling for initial or recurring execution of malicious code.' },
    { id: 'T1053.007', name: 'Container Orchestration Job', techniqueId: 'T1053', desc: 'Adversaries may abuse task scheduling functionality provided by container orchestration tools such as Kubernetes to schedule deployment of containers configured to execute malicious code.' },
  ];

  const subtechniques = await Promise.all(
    subtechniquesData.map(subtech =>
      prisma.mitreSubtechnique.create({
        data: {
          id: subtech.id,
          name: subtech.name,
          description: subtech.desc,
          url: `https://attack.mitre.org/techniques/${subtech.id.replace('.', '/')}/`,
          techniqueId: subtech.techniqueId,
        },
      })
    )
  );

  console.log(`   ✅ Created ${tactics.length} MITRE tactics`);
  console.log(`   ✅ Created ${techniques.length} MITRE techniques`);
  console.log(`   ✅ Created ${subtechniques.length} MITRE subtechniques`);

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Introduction to Cybersecurity',
        slug: 'intro-to-cybersecurity',
        description: 'Learn the fundamentals of cybersecurity including threat landscape, basic defense mechanisms, and security best practices. This comprehensive course covers the CIA triad, risk management, and essential security frameworks.',
        difficulty: Difficulty.BEGINNER,
        category: Category.GENERAL,
        price: 0,
        isFree: true,
        isPublished: true,
        duration: 240,
        prerequisites: ['Basic computer skills'],
        learningOutcomes: ['Understand cybersecurity fundamentals', 'Identify common threats', 'Implement basic security measures'],
      },
    }),
    prisma.course.create({
      data: {
        title: 'Web Application Security',
        slug: 'web-application-security',
        description: 'Deep dive into web application security vulnerabilities including OWASP Top 10, secure coding practices, and penetration testing methodologies.',
        difficulty: Difficulty.INTERMEDIATE,
        category: Category.RED_TEAM,
        price: 9900,
        isFree: false,
        isPublished: true,
        duration: 480,
        prerequisites: ['Basic web development knowledge', 'HTTP protocol understanding'],
        learningOutcomes: ['Identify web vulnerabilities', 'Implement secure coding practices', 'Perform security testing'],
      },
    }),
    prisma.course.create({
      data: {
        title: 'Network Defense and Monitoring',
        slug: 'network-defense-monitoring',
        description: 'Master network security concepts including firewall configuration, intrusion detection systems, and security monitoring.',
        difficulty: Difficulty.INTERMEDIATE,
        category: Category.BLUE_TEAM,
        price: 14900,
        isFree: false,
        isPublished: true,
        duration: 600,
        prerequisites: ['Basic networking knowledge', 'TCP/IP understanding'],
        learningOutcomes: ['Configure network defenses', 'Monitor network traffic', 'Respond to security incidents'],
      },
    }),
  ]);

  // Create MITRE mappings for courses
  await Promise.all([
    prisma.courseMitreMapping.create({
      data: {
        courseId: courses[0].id,
        tacticId: tactics[0].id,
      },
    }),
    prisma.courseMitreMapping.create({
      data: {
        courseId: courses[1].id,
        techniqueId: techniques[0].id,
      },
    }),
  ]);

  // Create modules
  const modules = [];
  for (let i = 0; i < courses.length; i++) {
    const courseModules = await Promise.all([
      prisma.module.create({
        data: {
          title: `Module 1: Getting Started`,
          description: `Introduction to ${courses[i].title}`,
          order: 1,
          courseId: courses[i].id,
        },
      }),
      prisma.module.create({
        data: {
          title: `Module 2: Core Concepts`,
          description: `Fundamental concepts of ${courses[i].title}`,
          order: 2,
          courseId: courses[i].id,
        },
      }),
      prisma.module.create({
        data: {
          title: `Module 3: Practical Applications`,
          description: `Hands-on exercises and real-world scenarios`,
          order: 3,
          courseId: courses[i].id,
        },
      }),
    ]);
    modules.push(...courseModules);
  }

  // Create videos first
  const videos = await Promise.all([
    prisma.video.create({
      data: {
        title: 'Course Introduction',
        description: 'Welcome to the course',
        originalFilename: 'intro.mp4',
        originalSize: 50000000,
        originalUrl: 'https://example.com/intro.mp4',
        status: VideoStatus.READY,
        duration: 300,
        playlistUrl: 'https://example.com/playlist.m3u8',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      },
    }),
    prisma.video.create({
      data: {
        title: 'Core Concepts',
        description: 'Understanding the fundamentals',
        originalFilename: 'concepts.mp4',
        originalSize: 75000000,
        originalUrl: 'https://example.com/concepts.mp4',
        status: VideoStatus.READY,
        duration: 600,
        playlistUrl: 'https://example.com/concepts.m3u8',
        thumbnailUrl: 'https://example.com/concepts-thumb.jpg',
      },
    }),
  ]);

  // Create lessons
  const lessons = [];
  for (let i = 0; i < modules.length; i++) {
    const moduleLessons = await Promise.all([
      prisma.lesson.create({
        data: {
          title: `Lesson 1: Introduction`,
          type: LessonType.VIDEO,
          order: 1,
          moduleId: modules[i].id,
          videoId: videos[0].id,
          isFreePreview: i === 0,
        },
      }),
      prisma.lesson.create({
        data: {
          title: `Lesson 2: Deep Dive`,
          type: LessonType.VIDEO,
          order: 2,
          moduleId: modules[i].id,
          videoId: videos[1].id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: `Lesson 3: Quiz`,
          type: LessonType.QUIZ,
          order: 3,
          moduleId: modules[i].id,
        },
      }),
    ]);
    lessons.push(...moduleLessons);
  }

  // Create quizzes for quiz lessons
  const quizLessons = lessons.filter(l => l.type === LessonType.QUIZ);
  const quizzes = await Promise.all(
    quizLessons.map(lesson =>
      prisma.quiz.create({
        data: {
          lessonId: lesson.id,
          passingScore: 70,
          timeLimit: 30,
        },
      })
    )
  );

  // Create quiz questions
  for (const quiz of quizzes) {
    await Promise.all([
      prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          question: 'What is the primary goal of cybersecurity?',
          type: QuestionType.MULTIPLE_CHOICE,
          order: 1,
          options: JSON.stringify([
            { id: 'a', text: 'To make systems faster' },
            { id: 'b', text: 'To protect systems and data' },
            { id: 'c', text: 'To reduce costs' },
            { id: 'd', text: 'To improve user experience' },
          ]),
          correctAnswer: JSON.stringify({ id: 'b' }),
          explanation: 'The primary goal of cybersecurity is to protect systems, networks, and data from digital attacks.',
          points: 1,
        },
      }),
      prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          question: 'True or False: Phishing is a technical attack that exploits software vulnerabilities.',
          type: QuestionType.TRUE_FALSE,
          order: 2,
          correctAnswer: JSON.stringify({ answer: false }),
          explanation: 'False. Phishing is a social engineering attack that targets humans, not a technical vulnerability.',
          points: 1,
        },
      }),
    ]);
  }

  // Create labs
  const labs = await Promise.all([
    prisma.lab.create({
      data: {
        lessonId: lessons.find(l => l.title.includes('Deep Dive') && l.moduleId === modules[3].id)?.id || lessons[4].id,
        name: 'Security Lab Environment',
        description: 'Hands-on laboratory environment for practicing security techniques',
        templateId: 'ubuntu-22.04',
        networkTopology: JSON.stringify({
          type: 'isolated',
          subnets: ['10.0.1.0/24'],
        }),
        objectives: JSON.stringify([
          { id: '1', title: 'Set up environment', description: 'Configure the lab environment', points: 25 },
          { id: '2', title: 'Execute security scan', description: 'Perform security analysis', points: 50 },
          { id: '3', title: 'Document findings', description: 'Create security report', points: 25 },
        ]),
        estimatedTime: 90,
        hints: JSON.stringify([
          { order: 1, content: 'Start by checking the network configuration' },
          { order: 2, content: 'Use built-in security tools for analysis' },
        ]),
      },
    }),
  ]);

  // Create challenges
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: 'SQL Injection Challenge',
        description: 'Find and exploit SQL injection vulnerabilities in the target application.',
        category: 'Web Security',
        difficulty: Difficulty.INTERMEDIATE,
        flag: 'ZDI{SQL_MASTER_2024}',
        points: 150,
        hints: JSON.stringify([
          { order: 1, content: 'Try common SQL injection payloads', penaltyPoints: 10 },
          { order: 2, content: 'Check for error-based injection', penaltyPoints: 15 },
        ]),
        isPublished: true,
      },
    }),
    prisma.challenge.create({
      data: {
        title: 'XSS Detection',
        description: 'Identify and exploit cross-site scripting vulnerabilities.',
        category: 'Web Security',
        difficulty: Difficulty.BEGINNER,
        flag: 'ZDI{XSS_EXPERT_2024}',
        points: 100,
        hints: JSON.stringify([
          { order: 1, content: 'Test input fields with XSS payloads', penaltyPoints: 5 },
        ]),
        isPublished: true,
      },
    }),
    prisma.challenge.create({
      data: {
        title: 'Network Reconnaissance',
        description: 'Perform network reconnaissance to gather information about the target.',
        category: 'Network Security',
        difficulty: Difficulty.BEGINNER,
        flag: 'ZDI{NETWORK_SCOUT_2024}',
        points: 75,
        isPublished: true,
      },
    }),
  ]);

  // Create MITRE mappings for challenges
  await Promise.all([
    prisma.challengeMitreMapping.create({
      data: {
        challengeId: challenges[0].id,
        techniqueId: techniques[0].id,
      },
    }),
    prisma.challengeMitreMapping.create({
      data: {
        challengeId: challenges[1].id,
        techniqueId: techniques[0].id,
      },
    }),
  ]);

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        points: 10,
        type: AchievementType.LESSON_COMPLETE,
        criteria: JSON.stringify({ count: 1 }),
        tier: 'bronze',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Quick Learner',
        description: 'Complete 5 lessons',
        icon: '📚',
        points: 50,
        type: AchievementType.LESSON_COMPLETE,
        criteria: JSON.stringify({ count: 5 }),
        tier: 'silver',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Course Graduate',
        description: 'Complete your first course',
        icon: '🎓',
        points: 100,
        type: AchievementType.COURSE_COMPLETE,
        criteria: JSON.stringify({ count: 1 }),
        tier: 'gold',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Challenge Champion',
        description: 'Solve 10 challenges',
        icon: '🏆',
        points: 200,
        type: AchievementType.CHALLENGE_COMPLETE,
        criteria: JSON.stringify({ count: 10 }),
        tier: 'platinum',
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Perfect Score',
        description: 'Get 100% on a quiz',
        icon: '💯',
        points: 25,
        type: AchievementType.QUIZ_PERFECT,
        criteria: JSON.stringify({ score: 100 }),
        tier: 'silver',
      },
    }),
  ]);

  // Create enrollments
  await Promise.all([
    ...students.map(student =>
      prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: courses[0].id,
          progress: student.id === students[0].id ? 100 : 50,
          completedAt: student.id === students[0].id ? new Date() : null,
        },
      })
    ),
    prisma.enrollment.create({
      data: {
        userId: students[0].id,
        courseId: courses[1].id,
        progress: 25,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: students[1].id,
        courseId: courses[2].id,
        progress: 75,
      },
    }),
  ]);

  // Create progress records
  await Promise.all([
    prisma.progress.createMany({
      data: [
        {
          userId: students[0].id,
          lessonId: lessons[0].id,
          completed: true,
          completedAt: new Date(),
          watchTime: 300,
        },
        {
          userId: students[0].id,
          lessonId: lessons[1].id,
          completed: true,
          completedAt: new Date(),
          watchTime: 600,
        },
        {
          userId: students[1].id,
          lessonId: lessons[0].id,
          completed: true,
          completedAt: new Date(),
          watchTime: 280,
        },
        {
          userId: students[2].id,
          lessonId: lessons[0].id,
          completed: false,
          watchTime: 150,
        },
      ],
    }),
  ]);

  // Create user achievements
  await Promise.all([
    prisma.userAchievement.create({
      data: {
        userId: students[0].id,
        achievementId: achievements[0].id,
        progress: 1,
        earnedAt: new Date(),
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: students[0].id,
        achievementId: achievements[1].id,
        progress: 5,
        earnedAt: new Date(),
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: students[0].id,
        achievementId: achievements[2].id,
        progress: 1,
        earnedAt: new Date(),
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: students[1].id,
        achievementId: achievements[0].id,
        progress: 1,
        earnedAt: new Date(),
      },
    }),
  ]);

  // Create challenge submissions
  await Promise.all([
    prisma.submission.create({
      data: {
        userId: students[0].id,
        challengeId: challenges[0].id,
        flag: 'ZDI{SQL_MASTER_2024}',
        isCorrect: true,
        points: 150,
      },
    }),
    prisma.submission.create({
      data: {
        userId: students[1].id,
        challengeId: challenges[1].id,
        flag: 'ZDI{XSS_EXPERT_2024}',
        isCorrect: true,
        points: 100,
      },
    }),
    prisma.submission.create({
      data: {
        userId: students[0].id,
        challengeId: challenges[2].id,
        flag: 'wrong_flag',
        isCorrect: false,
        points: 0,
      },
    }),
  ]);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n👥 Users created:');
  console.log('🔵 Admin: admin@zerodayinstitute.com / password123');
  console.log('🟢 Instructor: instructor@zerodayinstitute.com / password123');
  console.log('🔵 Students: john.student@zerodayinstitute.com / password123');
  console.log('          sarah.student@zerodayinstitute.com / password123');
  console.log('          mike.student@zerodayinstitute.com / password123');
  console.log(`\n📚 Content created:`);
  console.log(`- ${courses.length} Courses`);
  console.log(`- ${modules.length} Modules`);
  console.log(`- ${lessons.length} Lessons`);
  console.log(`- ${quizzes.length} Quizzes`);
  console.log(`- ${labs.length} Labs`);
  console.log(`- ${challenges.length} Challenges`);
  console.log(`- ${achievements.length} Achievements`);
  console.log(`\n🎯 MITRE ATT&CK Framework:`);
  console.log(`- ${tactics.length} Tactics`);
  console.log(`- ${techniques.length} Techniques`);
  console.log(`- ${subtechniques.length} Subtechniques`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });