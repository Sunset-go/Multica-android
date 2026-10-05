/**
 * Translation dictionary for the mobile app's i18n system.
 *
 * Keys are grouped by feature area. Each key maps to `{ zh, en }`.
 * The `useT()` hook returns the dictionary for the current locale;
 * components access translations via `t.settings.title` etc.
 *
 * `getT()` is the non-hook equivalent for lib/ pure functions — it reads
 * the current locale from the Zustand store state directly.
 *
 * When adding new UI strings, add the key here in both languages and
 * replace the hardcoded string in the component with `t.<group>.<key>`.
 *
 * This is a lightweight alternative to i18next — the mobile app has a
 * bounded string surface, and a plain object avoids the dependency +
 * async JSON loading overhead.
 */
import { useLanguageStore } from "@/data/language-store";
import type { IssuePriority, IssueStatus } from "@multica/core/types";
import type { ProjectPriority, ProjectStatus } from "@multica/core/types";

export type Locale = "zh" | "en";

export interface TranslationDict {
  common: {
    back: string;
    cancel: string;
    confirm: string;
    close: string;
    save: string;
    delete: string;
    retry: string;
    loading: string;
    search: string;
    error: string;
    unknownError: string;
    discard: string;
    done: string;
    clear: string;
    create: string;
    saving: string;
    creating: string;
    cancelEditing: string;
    keepEditing: string;
    discardChanges: string;
    openOnWeb: string;
    copyLink: string;
    copy: string;
    copyAll: string;
    selectText: string;
    moreReactions: string;
    addReaction: string;
    resend: string;
    sending: string;
    verifying: string;
    resendCodeIn: (s: number) => string;
  };
  tabs: {
    inbox: string;
    myIssues: string;
    chat: string;
    more: string;
  };
  more: {
    pinned: string;
    issues: string;
    projects: string;
    agents: string;
    accountSettings: string;
    switchWorkspace: string;
    workspace: string;
  };
  settings: {
    title: string;
    account: string;
    notifications: string;
    notificationsSubtitle: string;
    workspace: string;
    appearance: string;
    language: string;
    signOut: string;
    signOutTitle: string;
    signOutMessage: string;
    workspaceLoadError: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    langChinese: string;
    langEnglish: string;
    profile: string;
  };
  screens: {
    issue: string;
    project: string;
    editProject: string;
    editIssue: string;
    newProject: string;
    newIssue: string;
    search: string;
    assignee: string;
    mention: string;
    pins: string;
    issues: string;
    projects: string;
    agents: string;
    settings: string;
    profile: string;
    notifications: string;
  };
  auth: {
    signInTitle: string;
    signInSubtitle: string;
    sendCode: string;
    enterCode: string;
    codeSentTo: string;
    verify: string;
    resendCode: string;
    useDifferentEmail: string;
    sendCodeFailed: string;
    verifyCodeFailed: string;
    resendCodeFailed: string;
    codeMismatch: string;
    codeExpired: string;
    tooManyAttempts: string;
    sessionExpired: string;
    connectionError: string;
  };
  workspaceSelect: {
    signedInAs: string;
    selectWorkspace: string;
    loadFailed: string;
    noWorkspaces: string;
    signOut: string;
  };
  switchWorkspace: {
    title: string;
    confirm: (name: string) => string;
    switch: string;
    current: (name: string) => string;
    switchTo: (name: string) => string;
  };
  chat: {
    title: string;
    noChats: string;
    untitled: string;
    archived: string;
    deleteConfirm: string;
    deleteConfirmTitle: string;
    noAgentSelected: string;
    noAgents: string;
    chatArchived: string;
    agentNeedsRuntime: string;
    runtimeRequired: string;
    runtimeRequiredMsg: string;
    newChat: string;
    sessionsAndAgentPicker: string;
    sessionActions: string;
    noAgentAvailable: string;
    noAgentAvailableMsg: string;
    agentDisconnected: (name: string) => string;
    agentOffline: (name: string) => string;
    agentNeedsRuntimeBanner: (name: string) => string;
    agent: string;
    chat: string;
    welcomeBack: string;
    hiAgent: (name: string) => string;
    tryAsking: string;
    chatWithAgents: string;
    theyKnow: string;
    issuesProjectsSkills: string;
    askSummary: string;
    suggestions: {
      listIssues: string;
      summarize: string;
      planNext: string;
    };
    noTextReply: string;
    suggestedFollowups: string;
    repliedIn: (ms: string) => string;
    finishedIn: (ms: string) => string;
    failedAfter: (ms: string) => string;
    showDetails: string;
    stopAgent: string;
    messagePlaceholder: string;
    agentWorking: string;
    chatUnavailable: string;
    stepCount: (n: number) => string;
  };
  agentEdit: {
    title: string;
    profile: string;
    name: string;
    namePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    avatarUrl: string;
    avatarUrlPlaceholder: string;
    instructions: string;
    instructionsPlaceholder: string;
    instructionsSystemNote: string;
    runtimeConfig: string;
    runtime: string;
    model: string;
    thinkingLevel: string;
    serviceTier: string;
    maxConcurrentTasks: string;
    notBound: string;
    noRuntimeSelected: string;
    noModelSelected: string;
    noThinkingLevel: string;
    noServiceTier: string;
    pickRuntime: string;
    pickModel: string;
    pickThinkingLevel: string;
    pickServiceTier: string;
    loadingModels: string;
    modelsUnavailable: string;
    permissions: string;
    permissionScope: string;
    scopePrivate: string;
    scopeWorkspace: string;
    scopeMembers: string;
    permissionOwnerOnly: string;
    skills: string;
    skillsSearchPlaceholder: string;
    noSkills: string;
    noSkillsAssigned: string;
    envVars: string;
    envKey: string;
    envValue: string;
    envAdd: string;
    envHidden: string;
    save: string;
    saving: string;
    saveSuccess: string;
    saveError: string;
    loadError: string;
    agentNotFound: string;
  };
  inbox: {
    title: string;
    actions: string;
    markAllRead: string;
    archiveAllRead: string;
    archiveCompleted: string;
    archiveAll: string;
    archiveAllTitle: string;
    archiveAllMsg: string;
    empty: string;
    emptyDesc: string;
    loadFailed: (msg: string) => string;
    archive: string;
  };
  issues: {
    myIssues: string;
    assignedToMe: string;
    createdByMe: string;
    agentsTab: string;
    loadFailed: string;
    noMatch: string;
    noAssigned: string;
    noCreated: string;
    noAgentIssues: string;
    noIssuesInWorkspace: string;
    noMemberIssues: string;
    noSquadIssues: string;
    filter: string;
    reset: string;
    status: string;
    priority: string;
    createIssue: string;
    newIssue: string;
    issueActions: string;
    pin: string;
    unpin: string;
    editDetails: string;
    deleteIssue: string;
    deleteIssueTitle: string;
    deleteIssueMsg: (id: string) => string;
    notFound: string;
    loadFailedIssue: string;
    titleField: string;
    titlePlaceholder: string;
    createFailed: string;
    discardTitle: string;
    discardMsg: string;
    saveFailed: string;
    titleFieldLabel: string;
    descriptionFieldLabel: string;
    descriptionPlaceholder: string;
    dueDate: string;
    searchPeople: string;
    searchProjects: string;
    searchLabels: string;
    referenceIssue: string;
    searchPeopleOrIssues: string;
    agentRuns: string;
    active: string;
    past: string;
    addReaction: string;
    run: string;
    runs: (count: number) => string;
    working: string;
    agentWorkingOpenRuns: string;
    noDescription: string;
    addComment: string;
    addCommentMention: string;
    descriptionMention: string;
    failedToSend: string;
    retrySend: string;
    discardFailed: string;
    reply: string;
    reactWith: string;
    copyLink: string;
    resolveThread: string;
    unresolveThread: string;
    deleteComment: string;
    deleteCommentTitle: string;
    deleteCommentMsg: string;
    removeMention: (name: string) => string;
    removeFile: (name: string) => string;
    openFile: (name: string) => string;
    resolvedBy: string;
    collapse: string;
    collapseResolved: string;
    resolvedThreadLabel: (authors: string, total: number) => string;
    createIssueAccessibility: string;
    jumpToNew: (count: number) => string;
    scrollToLatest: string;
    scrollToTop: string;
  };
  projects: {
    title: string;
    projectActions: string;
    pin: string;
    unpin: string;
    editDetails: string;
    delete: string;
    deleteTitle: string;
    deleteMsg: string;
    notFound: string;
    loadFailed: string;
    newProject: string;
    noProjects: string;
    noProjectsDesc: string;
    createProject: string;
    discardTitle: string;
    discardMsg: string;
    discardProject: string;
    discardProjectMsg: string;
    createFailed: string;
    cancel: string;
    save: string;
    saving: string;
    creating: string;
    loading: string;
    iconEmoji: string;
    titleField: string;
    titlePlaceholder: string;
    descriptionField: string;
    descriptionPlaceholder: string;
    statusField: string;
    priorityField: string;
    leadField: string;
    labelField: string;
    projectField: string;
    dueDateField: string;
    unassigned: string;
    unknown: string;
    attachResource: string;
    attaching: string;
    attach: string;
    attachFailed: string;
    resourceUrl: string;
    labelOptional: string;
    labelPlaceholder: string;
    detachResource: string;
    detachResourceTitle: string;
    detach: string;
    resources: string;
    add: string;
    noResources: string;
    searchMembersOrAgents: string;
    relatedIssuesLoadFailed: string;
    noIssues: string;
    lead: string;
    status: string;
    priority: string;
    needsRuntime: string;
    leaderNeedsRuntime: string;
    squad: string;
    noMatches: string;
    noMembersOrAgents: string;
    everyone: string;
    all: string;
    member: string;
    agent: string;
    noProject: string;
    noProjectsInWorkspace: string;
    searchIssuesAndProjects: string;
    noResults: string;
    typeToSearch: string;
    noLabels: string;
  };
  pins: {
    loadFailed: string;
    noPins: string;
    noPinsDesc: string;
    unavailableIssue: string;
    unavailableProject: string;
    unavailableTapToUnpin: (type: string) => string;
  };
  profile: {
    takePhoto: string;
    chooseFromLibrary: string;
    removePhoto: string;
    cancel: string;
    permissionNeeded: string;
    cameraAccessRequired: string;
    imageTooLarge: string;
    imageTooLargeDesc: string;
    uploadFailed: string;
    uploadFailedDesc: string;
    removeFailed: string;
    removeFailedDesc: string;
    saveFailed: string;
    saveFailedDesc: string;
    yourAvatar: string;
    tapToChange: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailReadOnly: string;
    save: string;
    saving: string;
  };
  notifications: {
    assignments: string;
    assignmentsDesc: string;
    statusChanges: string;
    statusChangesDesc: string;
    comments: string;
    commentsDesc: string;
    mentions: string;
    mentionsDesc: string;
    issueUpdates: string;
    issueUpdatesDesc: string;
    agentActivity: string;
    agentActivityDesc: string;
    loadFailed: string;
    inboxTitle: string;
    inboxDesc: string;
    systemTitle: string;
    systemDesc: string;
    systemNotifications: string;
    systemNotificationsDesc: string;
  };
  composer: {
    messagePlaceholder: string;
    agentWorking: string;
    chatUnavailable: string;
    cancelReply: string;
    mentionSomeone: string;
    mentionSomeoneOrIssue: string;
    uploadImage: string;
    uploadFile: string;
    send: string;
    fileTooLarge: string;
    fileTooLargeDesc: string;
    uploadFailed: string;
    replyingTo: (name: string) => string;
  };
  markdown: {
    mention: string;
    bulletList: string;
    checklist: string;
    codeBlock: string;
    quote: string;
    attachImage: string;
    attachFile: string;
  };
  search: {
    recent: string;
    projects: string;
    issues: string;
    cancelled: string;
  };
  issueStatus: Record<IssueStatus, string>;
  issuePriority: Record<IssuePriority, string>;
  projectStatus: Record<ProjectStatus, string>;
  projectPriority: Record<ProjectPriority, string>;
  inboxDetail: {
    type: {
      issue_assigned: string;
      issue_subscribed: string;
      unassigned: string;
      assignee_changed: string;
      status_changed: string;
      priority_changed: string;
      start_date_changed: string;
      due_date_changed: string;
      new_comment: string;
      mentioned: string;
      review_requested: string;
      task_completed: string;
      task_failed: string;
      agent_blocked: string;
      agent_completed: string;
      reaction_added: string;
      quick_create_done: string;
      quick_create_failed: string;
      quick_create_unconfirmed: string;
    };
    setStatusTo: string;
    setPriorityTo: string;
    assignedTo: (name: string) => string;
    removedAssignee: string;
    dueDateSetTo: (date: string) => string;
    removedDueDate: string;
    reactedWith: (emoji: string) => string;
    createdByAgent: (id: string) => string;
    failedDetail: (detail: string) => string;
  };
  activity: {
    createdIssue: string;
    statusChanged: (from: string, to: string) => string;
    priorityChanged: (from: string, to: string) => string;
    selfAssigned: string;
    removedAssignee: string;
    assignedTo: (name: string) => string;
    changedAssignee: string;
    removedStartDate: string;
    setStartDate: (date: string) => string;
    removedDueDate: string;
    setDueDate: (date: string) => string;
    renamed: (from: string, to: string) => string;
    updatedDescription: string;
    completedTasks: (n: number) => string;
    failedTasks: (n: number) => string;
    evaluatedWithAction: (reason: string) => string;
    evaluatedNoAction: string;
    evaluatedNoActionReason: (reason: string) => string;
    evaluationFailed: (reason: string) => string;
    evaluationFailedNoReason: string;
    evaluatedSquadTrigger: string;
    status: Record<IssueStatus, string>;
    priority: Record<IssuePriority, string>;
  };
  runRow: {
    cancelTask: string;
    cancelTaskTitle: string;
    cancelTaskMsg: string;
    keepRunning: string;
    cancel: string;
    commentTask: string;
    autopilotRun: string;
    chatTask: string;
    quickCreate: string;
    task: string;
    status: {
      queued: string;
      dispatched: string;
      running: string;
      completed: string;
      failed: string;
      cancelled: string;
      waiting_local_directory: string;
      queued_expired: string;
      runtime_offline: string;
      runtime_recovery: string;
      timeout: string;
      iteration_limit: string;
      agent_blocked: string;
      api_invalid_request: string;
      skill_bundle_unavailable: string;
      "agent_error.provider_auth_or_access": string;
      "agent_error.provider_quota_limit": string;
      "agent_error.provider_capacity_or_rate_limit": string;
      "agent_error.provider_server_error": string;
      "agent_error.provider_network": string;
      "agent_error.process_failure": string;
      "agent_error.empty_or_unparseable_output": string;
      "agent_error.agent_timeout": string;
      "agent_error.context_overflow": string;
      "agent_error.missing_config": string;
      "agent_error.model_not_found_or_unavailable": string;
      "agent_error.runtime_version_unsupported": string;
      "agent_error.runtime_missing_executable": string;
      "agent_error.unknown": string;
      agent_error: string;
      codex_semantic_inactivity: string;
      manual: string;
    };
    failed: string;
  };
  statusPill: {
    tools: {
      bash: string;
      exec: string;
      read: string;
      glob: string;
      grep: string;
      write: string;
      edit: string;
      multi_edit: string;
      multiedit: string;
      web_search: string;
      websearch: string;
    };
    retrying: string;
    offline: string;
    reconnecting: string;
    queued: string;
    starting: string;
    thinking: string;
    typing: string;
    working: string;
  };
  timeAgo: {
    justNow: string;
    minutesAgo: (n: number) => string;
    hoursAgo: (n: number) => string;
    daysAgo: (n: number) => string;
    weeksAgo: (n: number) => string;
  };
  code: {
    copyCode: string;
    codeCopied: string;
  };
}

// ============================================================================
// Chinese translations
// ============================================================================
const zh: TranslationDict = {
  common: {
    back: "返回",
    cancel: "取消",
    confirm: "确认",
    close: "关闭",
    save: "保存",
    delete: "删除",
    retry: "重试",
    loading: "加载中…",
    search: "搜索",
    error: "出错",
    unknownError: "未知错误",
    discard: "放弃",
    done: "完成",
    clear: "清除",
    create: "创建",
    saving: "保存中…",
    creating: "创建中…",
    cancelEditing: "继续编辑",
    keepEditing: "继续编辑",
    discardChanges: "放弃更改？",
    openOnWeb: "在网页中打开",
    copyLink: "复制链接",
    copy: "复制",
    copyAll: "全部复制",
    selectText: "选择文本",
    moreReactions: "更多表情…",
    addReaction: "添加表情",
    resend: "重发验证码",
    sending: "发送中…",
    verifying: "验证中…",
    resendCodeIn: (s) => `${s} 秒后重发验证码`,
  },
  tabs: {
    inbox: "收件箱",
    myIssues: "我的任务",
    chat: "聊天",
    more: "更多",
  },
  more: {
    pinned: "已固定",
    issues: "任务",
    projects: "项目",
    agents: "智能体",
    accountSettings: "账户设置",
    switchWorkspace: "切换工作区",
    workspace: "工作区",
  },
  settings: {
    title: "设置",
    account: "账户",
    notifications: "通知",
    notificationsSubtitle: "收件箱和系统通知",
    workspace: "工作区",
    appearance: "外观",
    language: "语言",
    signOut: "退出登录",
    signOutTitle: "退出登录",
    signOutMessage: "您将需要再次登录才能在此设备上使用 Multica。",
    workspaceLoadError: "工作区加载失败",
    themeLight: "浅色",
    themeDark: "深色",
    themeSystem: "跟随系统",
    langChinese: "中文",
    langEnglish: "English",
    profile: "个人资料",
  },
  screens: {
    issue: "任务",
    project: "项目",
    editProject: "编辑项目",
    editIssue: "编辑任务",
    newProject: "新建项目",
    newIssue: "新建任务",
    search: "搜索",
    assignee: "负责人",
    mention: "提及",
    pins: "已固定",
    issues: "任务",
    projects: "项目",
    agents: "智能体",
    settings: "设置",
    profile: "个人资料",
    notifications: "通知",
  },
  auth: {
    signInTitle: "登录 Multica",
    signInSubtitle: "输入您的邮箱，我们会向您发送验证码。",
    sendCode: "发送验证码",
    enterCode: "输入验证码",
    codeSentTo: "我们已发送 6 位验证码到 {email}",
    verify: "验证",
    resendCode: "重发验证码",
    useDifferentEmail: "使用其他邮箱",
    sendCodeFailed: "发送验证码失败，请重试。",
    verifyCodeFailed: "验证码校验失败，请重试。",
    resendCodeFailed: "重新发送验证码失败，请重试。",
    codeMismatch: "验证码不匹配。请检查后重试。",
    codeExpired: "验证码已过期。点击重发获取新码。",
    tooManyAttempts: "尝试次数过多。请稍候再试。",
    sessionExpired: "会话已过期。请重新登录。",
    connectionError: "无法连接 Multica。请检查网络后重试。",
  },
  workspaceSelect: {
    signedInAs: "当前登录",
    selectWorkspace: "选择工作区",
    loadFailed: "工作区加载失败",
    noWorkspaces: "您尚未加入任何工作区。请联系工作区管理员邀请您。",
    signOut: "退出登录",
  },
  switchWorkspace: {
    title: "切换工作区",
    confirm: (name) => `切换到 "${name}"？`,
    switch: "切换",
    current: (name) => `${name}，当前工作区`,
    switchTo: (name) => `切换到 ${name}`,
  },
  chat: {
    title: "聊天",
    noChats: "还没有聊天。",
    untitled: "未命名聊天",
    archived: "已归档",
    deleteConfirm: "删除此聊天？",
    deleteConfirmTitle: "删除此聊天？",
    noAgentSelected: "未选择智能体",
    noAgents: "此工作区没有智能体",
    chatArchived: "此聊天已归档",
    agentNeedsRuntime: "智能体需要绑定运行时",
    runtimeRequired: "需要运行时",
    runtimeRequiredMsg: "在发送消息前，请先在网页或桌面端为该智能体绑定运行时。",
    newChat: "新对话",
    sessionsAndAgentPicker: "会话和智能体选择器",
    sessionActions: "会话操作",
    noAgentAvailable: "无可用智能体",
    noAgentAvailableMsg: `在“更多” → “智能体”中添加或启用智能体后即可开始对话。`,
    agentDisconnected: (name) => `${name} 刚刚可能断开连接——消息将进入队列。`,
    agentOffline: (name) => `${name} 离线。消息会等待其运行时重新上线。`,
    agentNeedsRuntimeBanner: (name) => `${name} 运行前需要绑定运行时。请在网页或桌面端绑定。`,
    agent: "智能体",
    chat: "对话",
    welcomeBack: "欢迎回到 Multica",
    hiAgent: (name) => `你好，我是 ${name}`,
    tryAsking: "试试这样问",
    chatWithAgents: "与您的智能体对话",
    theyKnow: "它们熟悉您的工作区 ——",
    issuesProjectsSkills: "任务、项目、技能",
    askSummary: "可以请求总结、规划一天，或把小任务交出去。",
    suggestions: {
      listIssues: "按优先级列出我的未完成任务",
      summarize: "总结我今天完成的内容",
      planNext: "帮我规划下一步做什么",
    },
    noTextReply: "智能体在本回合完成，没有文字回复。",
    suggestedFollowups: "推荐的后续操作",
    repliedIn: (ms) => `已在 ${ms} 内回复`,
    finishedIn: (ms) => `已在 ${ms} 内完成`,
    failedAfter: (ms) => `在 ${ms} 后失败`,
    showDetails: "显示详情",
    stopAgent: "停止智能体",
    messagePlaceholder: "消息…",
    agentWorking: "智能体正在工作中…",
    chatUnavailable: "无法对话",
    stepCount: (n) => `${n} 个步骤`,
  },
  agentEdit: {
    title: "编辑智能体",
    profile: "资料",
    name: "名称",
    namePlaceholder: "智能体名称",
    description: "描述",
    descriptionPlaceholder: "一句话介绍这个智能体",
    avatarUrl: "头像链接",
    avatarUrlPlaceholder: "https://...",
    instructions: "指令",
    instructionsPlaceholder: "告诉智能体它应该做什么…",
    instructionsSystemNote: "系统智能体指令不可修改",
    runtimeConfig: "运行配置",
    runtime: "运行时",
    model: "模型",
    thinkingLevel: "思考深度",
    serviceTier: "服务层级",
    maxConcurrentTasks: "最大并发任务数",
    notBound: "未绑定",
    noRuntimeSelected: "未选择",
    noModelSelected: "未选择",
    noThinkingLevel: "默认",
    noServiceTier: "默认",
    pickRuntime: "选择运行时",
    pickModel: "选择模型",
    pickThinkingLevel: "选择思考深度",
    pickServiceTier: "选择服务层级",
    loadingModels: "加载模型中…",
    modelsUnavailable: "无法获取模型列表",
    permissions: "权限",
    permissionScope: "可见范围",
    scopePrivate: "私有",
    scopeWorkspace: "工作区",
    scopeMembers: "指定成员",
    permissionOwnerOnly: "权限修改仅所有者可执行",
    skills: "技能",
    skillsSearchPlaceholder: "搜索技能…",
    noSkills: "此工作区暂无技能",
    noSkillsAssigned: "未分配技能",
    envVars: "环境变量",
    envKey: "变量名",
    envValue: "值",
    envAdd: "添加变量",
    envHidden: "仅智能体所有者和工作区管理员可查看和编辑",
    save: "保存",
    saving: "保存中…",
    saveSuccess: "已保存",
    saveError: "保存失败",
    loadError: "加载失败",
    agentNotFound: "智能体不存在",
  },
  inbox: {
    title: "收件箱",
    actions: "收件箱操作",
    markAllRead: "全部标为已读",
    archiveAllRead: "归档所有已读",
    archiveCompleted: "归档已完成",
    archiveAll: "归档全部",
    archiveAllTitle: "归档全部？",
    archiveAllMsg: "这将归档所有收件箱条目，无论是否已读。您仍可在任务页面找到它们。",
    empty: "收件箱已清空",
    emptyDesc: "当有人 @提及您、分配任务，或智能体完成任务时，会显示在这里。",
    loadFailed: (msg) => `收件箱加载失败：${msg}`,
    archive: "归档",
  },
  issues: {
    myIssues: "我的任务",
    assignedToMe: "分配给我",
    createdByMe: "我创建的",
    agentsTab: "智能体",
    loadFailed: "任务加载失败",
    noMatch: "没有符合当前筛选的任务。",
    noAssigned: "没有分配给您的任务。",
    noCreated: "您尚未创建任何任务。",
    noAgentIssues: "还没有分配给您或智能体小队的任务。",
    noIssuesInWorkspace: "此工作区没有任务。",
    noMemberIssues: "没有分配给成员的任务。",
    noSquadIssues: "没有分配给智能体或小队的任务。",
    filter: "筛选",
    reset: "重置",
    status: "状态",
    priority: "优先级",
    createIssue: "新建任务",
    newIssue: "新建任务",
    issueActions: "任务操作",
    pin: "固定",
    unpin: "取消固定",
    editDetails: "编辑详情",
    deleteIssue: "删除任务",
    deleteIssueTitle: "删除任务？",
    deleteIssueMsg: (id) => `${id} 及其评论、表情和附件将被永久删除，无法撤销。`,
    notFound: "未找到",
    loadFailedIssue: "任务加载失败",
    titleField: "标题",
    titlePlaceholder: "任务标题",
    createFailed: "任务创建失败",
    discardTitle: "放弃更改？",
    discardMsg: "您对该任务的修改将丢失。",
    saveFailed: "保存失败",
    titleFieldLabel: "标题",
    descriptionFieldLabel: "描述",
    descriptionPlaceholder: "描述…（输入 @ 提及）",
    dueDate: "截止日期",
    searchPeople: "搜索人员",
    searchProjects: "搜索项目",
    searchLabels: "搜索标签",
    referenceIssue: "引用任务",
    searchPeopleOrIssues: "搜索人员或任务",
    agentRuns: "智能体运行",
    active: "进行中",
    past: "历史记录",
    addReaction: "添加表情",
    run: "运行",
    runs: (count) => `运行 · ${count}`,
    working: "工作中",
    agentWorkingOpenRuns: "智能体正在工作 — 打开运行",
    noDescription: "无描述。",
    addComment: "添加评论…",
    addCommentMention: "添加评论，输入 @ 提及…",
    descriptionMention: "描述…（输入 @ 提及）",
    failedToSend: "发送失败",
    retrySend: "重试发送评论",
    discardFailed: "丢弃发送失败的评论",
    reply: "回复",
    reactWith: "添加表情…",
    copyLink: "复制链接",
    resolveThread: "解决线程",
    unresolveThread: "重新打开线程",
    deleteComment: "删除评论",
    deleteCommentTitle: "删除评论？",
    deleteCommentMsg: "此评论将被永久删除，回复也会被一并移除。无法撤销。",
    removeMention: (name) => `移除提及 ${name}`,
    removeFile: (name) => `移除 ${name}`,
    openFile: (name) => `打开 ${name}`,
    resolvedBy: "由",
    collapse: "折叠",
    collapseResolved: "折叠已解决线程",
    resolvedThreadLabel: (authors, total) => `由 ${authors} 解决的线程，共 ${total} 条消息。点击展开。`,
    createIssueAccessibility: "新建任务",
    jumpToNew: (count) => `跳转到 ${count} 条新消息`,
    scrollToLatest: "滚动到最新",
    scrollToTop: "滚动到顶部",
  },
  projects: {
    title: "项目",
    projectActions: "项目操作",
    pin: "固定",
    unpin: "取消固定",
    editDetails: "编辑详情",
    delete: "删除",
    deleteTitle: "删除项目？",
    deleteMsg: "此操作无法撤销。项目内的任务将不再归属于任何项目。",
    notFound: "未找到",
    loadFailed: "项目加载失败",
    newProject: "新建项目",
    noProjects: "还没有项目",
    noProjectsDesc: "将相关任务组合成项目，以跟踪进度并指定负责人。",
    createProject: "创建项目",
    discardTitle: "放弃更改？",
    discardMsg: "您对该项目的修改将丢失。",
    discardProject: "放弃项目？",
    discardProjectMsg: "草稿将会丢失。",
    createFailed: "创建项目失败",
    cancel: "取消",
    save: "保存",
    saving: "保存中…",
    creating: "创建中…",
    loading: "加载中…",
    iconEmoji: "图标（表情）",
    titleField: "标题",
    titlePlaceholder: "项目标题",
    descriptionField: "描述",
    descriptionPlaceholder: "这个项目是关于什么的？",
    statusField: "状态",
    priorityField: "优先级",
    leadField: "负责人",
    labelField: "标签",
    projectField: "项目",
    dueDateField: "截止日期",
    unassigned: "未分配",
    unknown: "未知",
    attachResource: "附加仓库",
    attaching: "附加中…",
    attach: "附加",
    attachFailed: "附加资源失败",
    resourceUrl: "仓库 URL",
    labelOptional: "标签（可选）",
    labelPlaceholder: "例如：后端",
    detachResource: "分离资源？",
    detachResourceTitle: "分离资源？",
    detach: "分离",
    resources: "资源",
    add: "添加",
    noResources: "尚未添加资源。",
    searchMembersOrAgents: "搜索成员或智能体",
    relatedIssuesLoadFailed: "任务加载失败",
    noIssues: "还没有任务。",
    lead: "负责人",
    status: "状态",
    priority: "优先级",
    needsRuntime: "需要运行时",
    leaderNeedsRuntime: "负责人需要运行时",
    squad: "小队",
    noMatches: "无匹配结果。",
    noMembersOrAgents: "此工作区尚未添加成员或智能体。",
    everyone: "所有人",
    all: "全部",
    member: "成员",
    agent: "智能体",
    noProject: "无项目",
    noProjectsInWorkspace: "此工作区尚未创建项目。\n请在网页端创建。",
    searchIssuesAndProjects: "搜索任务和项目",
    noResults: "没有找到结果",
    typeToSearch: "输入以搜索任务和项目。",
    noLabels: "此工作区尚未添加标签。",
  },
  pins: {
    loadFailed: "固定项加载失败",
    noPins: "还没有固定项。从任务或项目的操作菜单中固定它们以显示在这里。",
    noPinsDesc: "还没有固定项。从任务或项目的操作菜单中固定它们以显示在这里。",
    unavailableIssue: "任务",
    unavailableProject: "项目",
    unavailableTapToUnpin: (type) => `${type} 不可用 — 点击取消固定`,
  },
  profile: {
    takePhoto: "拍照",
    chooseFromLibrary: "从相册选择",
    removePhoto: "删除照片",
    cancel: "取消",
    permissionNeeded: "需要权限",
    cameraAccessRequired: "需要相机权限才能拍照。",
    imageTooLarge: "图片过大",
    imageTooLargeDesc: "请选择 5 MB 以内的图片。",
    uploadFailed: "上传失败",
    uploadFailedDesc: "无法上传头像。",
    removeFailed: "删除失败",
    removeFailedDesc: "无法删除头像。",
    saveFailed: "保存失败",
    saveFailedDesc: "无法更新个人资料。",
    yourAvatar: "您的头像",
    tapToChange: "点击更换头像",
    name: "姓名",
    namePlaceholder: "您的姓名",
    email: "邮箱",
    emailReadOnly: "邮箱在注册时设置，无法在此修改。",
    save: "保存",
    saving: "保存中…",
  },
  notifications: {
    assignments: "分配",
    assignmentsDesc: "当您被分配或移除任务负责人时。",
    statusChanges: "状态变更",
    statusChangesDesc: "当任务状态变更时。",
    comments: "评论",
    commentsDesc: "您订阅的任务上的新评论。",
    mentions: "提及",
    mentionsDesc: "当有人 @提及您，包括 @all 和 @squad。",
    issueUpdates: "任务更新",
    issueUpdatesDesc: "标题、描述、标签、优先级或截止日期的编辑。",
    agentActivity: "智能体活动",
    agentActivityDesc: "当智能体接取、运行或完成任务时。",
    loadFailed: "通知偏好设置加载失败。",
    inboxTitle: "收件箱通知",
    inboxDesc: "哪些事件会显示在收件箱中。",
    systemTitle: "系统",
    systemDesc: "Multica 全局公告和重要账户事件。",
    systemNotifications: "系统通知",
    systemNotificationsDesc: "账户变更、安全警报、产品更新。",
  },
  composer: {
    messagePlaceholder: "输入消息…",
    agentWorking: "智能体正在工作中…",
    chatUnavailable: "无法对话",
    cancelReply: "取消回复",
    mentionSomeone: "提及人员",
    mentionSomeoneOrIssue: "提及人员或任务",
    uploadImage: "上传图片",
    uploadFile: "上传文件",
    send: "发送",
    fileTooLarge: "文件过大",
    fileTooLargeDesc: "文件必须小于 100 MB。",
    uploadFailed: "上传失败",
    replyingTo: (name) => `回复 ${name}`,
  },
  markdown: {
    mention: "提及人员",
    bulletList: "项目列表",
    checklist: "勾选列表",
    codeBlock: "代码块",
    quote: "引用",
    attachImage: "附加图片",
    attachFile: "附加文件",
  },
  search: {
    recent: "最近",
    projects: "项目",
    issues: "任务",
    cancelled: "已取消",
  },
  issueStatus: {
    backlog: "待办",
    todo: "待开始",
    in_progress: "进行中",
    in_review: "审阅中",
    done: "已完成",
    blocked: "已阻塞",
    cancelled: "已取消",
  },
  issuePriority: {
    none: "无优先级",
    low: "低",
    medium: "中",
    high: "高",
    urgent: "紧急",
  },
  projectStatus: {
    planned: "计划中",
    in_progress: "进行中",
    paused: "已暂停",
    completed: "已完成",
    cancelled: "已取消",
  },
  projectPriority: {
    urgent: "紧急",
    high: "高",
    medium: "中",
    low: "低",
    none: "无优先级",
  },
  inboxDetail: {
    type: {
      issue_assigned: "分配给我",
      issue_subscribed: "已订阅",
      unassigned: "已移除",
      assignee_changed: "重新分配",
      status_changed: "状态变更",
      priority_changed: "优先级变更",
      start_date_changed: "开始日期变更",
      due_date_changed: "截止日期变更",
      new_comment: "新评论",
      mentioned: "被提及",
      review_requested: "请求审阅",
      task_completed: "任务完成",
      task_failed: "任务失败",
      agent_blocked: "智能体阻塞",
      agent_completed: "智能体完成",
      reaction_added: "新增表情",
      quick_create_done: "快速创建完成",
      quick_create_failed: "快速创建失败",
      quick_create_unconfirmed: "快速创建需确认",
    },
    setStatusTo: "状态设为",
    setPriorityTo: "优先级设为",
    assignedTo: (name) => `分配给 ${name}`,
    removedAssignee: "移除了负责人",
    dueDateSetTo: (date) => `截止日期设为 ${date}`,
    removedDueDate: "移除了截止日期",
    reactedWith: (emoji) => `使用了表情 ${emoji}`,
    createdByAgent: (id) => `通过智能体创建：${id}`,
    failedDetail: (detail) => `失败：${detail}`,
  },
  activity: {
    createdIssue: "创建了任务",
    statusChanged: (from, to) => `修改了状态：${from} → ${to}`,
    priorityChanged: (from, to) => `修改了优先级：${from} → ${to}`,
    selfAssigned: "自分配给自己",
    removedAssignee: "移除了负责人",
    assignedTo: (name) => `分配给了 ${name}`,
    changedAssignee: "修改了负责人",
    removedStartDate: "移除了开始日期",
    setStartDate: (date) => `设置开始日期为 ${date}`,
    removedDueDate: "移除了截止日期",
    setDueDate: (date) => `设置截止日期为 ${date}`,
    renamed: (from, to) => `重命名："${from ?? "?"}" → "${to ?? "?"}"`,
    updatedDescription: "更新了描述",
    completedTasks: (n) => n > 1 ? `完成了 ${n} 个任务` : "完成了 1 个任务",
    failedTasks: (n) => n > 1 ? `${n} 个任务失败` : "1 个任务失败",
    evaluatedWithAction: (reason) => `已评估并执行操作：${reason}`,
    evaluatedNoAction: "已评估：无需操作",
    evaluatedNoActionReason: (reason) => `已评估：无需操作（${reason}）`,
    evaluationFailed: (reason) => `评估失败：${reason}`,
    evaluationFailedNoReason: "评估失败",
    evaluatedSquadTrigger: "评估了小队触发器",
    status: {
      backlog: "待办",
      todo: "待开始",
      in_progress: "进行中",
      in_review: "审阅中",
      done: "已完成",
      blocked: "已阻塞",
      cancelled: "已取消",
    },
    priority: {
      none: "无优先级",
      low: "低",
      medium: "中",
      high: "高",
      urgent: "紧急",
    },
  },
  runRow: {
    cancelTask: "取消任务",
    cancelTaskTitle: "取消任务？",
    cancelTaskMsg: "智能体会在当前步骤结束后停止。",
    keepRunning: "继续运行",
    cancel: "取消",
    commentTask: "评论任务",
    autopilotRun: "自动运行",
    chatTask: "对话任务",
    quickCreate: "快速创建",
    task: "任务",
    status: {
      queued: "排队中",
      dispatched: "启动中",
      running: "运行中",
      completed: "已完成",
      failed: "失败",
      cancelled: "已取消",
      waiting_local_directory: "等待目录",
      queued_expired: "队列等待超时",
      runtime_offline: "运行守护进程离线",
      runtime_recovery: "运行守护进程已重启",
      timeout: "任务超时",
      iteration_limit: "达到迭代次数上限",
      agent_blocked: "等待人工输入",
      api_invalid_request: "模型 API 拒绝了请求",
      skill_bundle_unavailable: "无法下载智能体的技能包",
      "agent_error.provider_auth_or_access": "模型供应商认证失败",
      "agent_error.provider_quota_limit": "模型供应商配额已用尽",
      "agent_error.provider_capacity_or_rate_limit": "被供应商限流",
      "agent_error.provider_server_error": "供应商服务器错误",
      "agent_error.provider_network": "访问供应商时网络错误",
      "agent_error.process_failure": "智能体进程崩溃",
      "agent_error.empty_or_unparseable_output": "智能体未返回可用输出",
      "agent_error.agent_timeout": "智能体超时",
      "agent_error.context_overflow": "超出上下文窗口",
      "agent_error.missing_config": "缺少 API 密钥或配置",
      "agent_error.model_not_found_or_unavailable": "模型不可用",
      "agent_error.runtime_version_unsupported": "Runner CLI 版本不受支持",
      "agent_error.runtime_missing_executable": "未安装 Runner CLI",
      "agent_error.unknown": "智能体执行错误",
      agent_error: "智能体执行错误",
      codex_semantic_inactivity: "Codex 语义静默超时",
      manual: "被用户取消",
    },
    failed: "失败",
  },
  statusPill: {
    tools: {
      bash: "运行命令",
      exec: "运行命令",
      read: "读取文件",
      glob: "读取文件",
      grep: "搜索代码",
      write: "编辑文件",
      edit: "编辑文件",
      multi_edit: "编辑文件",
      multiedit: "编辑文件",
      web_search: "搜索网页",
      websearch: "搜索网页",
    },
    retrying: "重试中",
    offline: "离线",
    reconnecting: "重连中",
    queued: "排队中",
    starting: "启动中",
    thinking: "思考中",
    typing: "输入中",
    working: "处理中",
  },
  timeAgo: {
    justNow: "刚刚",
    minutesAgo: (n) => `${n} 分钟前`,
    hoursAgo: (n) => `${n} 小时前`,
    daysAgo: (n) => `${n} 天前`,
    weeksAgo: (n) => `${n} 周前`,
  },
  code: {
    copyCode: "复制代码",
    codeCopied: "代码已复制",
  },
};

// ============================================================================
// English translations
// ============================================================================
const en: TranslationDict = {
  common: {
    back: "Back",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    save: "Save",
    delete: "Delete",
    retry: "Retry",
    loading: "Loading…",
    search: "Search",
    error: "Error",
    unknownError: "Unknown error",
    discard: "Discard",
    done: "Done",
    clear: "Clear",
    create: "Create",
    saving: "Saving…",
    creating: "Creating…",
    cancelEditing: "Keep editing",
    keepEditing: "Keep editing",
    discardChanges: "Discard changes?",
    openOnWeb: "Open on web",
    copyLink: "Copy link",
    copy: "Copy",
    copyAll: "Copy all",
    selectText: "Select text",
    moreReactions: "More reactions…",
    addReaction: "Add Reaction",
    resend: "Resend code",
    sending: "Sending…",
    verifying: "Verifying…",
    resendCodeIn: (s) => `Resend code in ${s}s`,
  },
  tabs: {
    inbox: "Inbox",
    myIssues: "My Issues",
    chat: "Chat",
    more: "More",
  },
  more: {
    pinned: "Pinned",
    issues: "Issues",
    projects: "Projects",
    agents: "Agents",
    accountSettings: "Account Settings",
    switchWorkspace: "Switch Workspace",
    workspace: "Workspace",
  },
  settings: {
    title: "Settings",
    account: "Account",
    notifications: "Notifications",
    notificationsSubtitle: "Inbox and system notifications",
    workspace: "Workspace",
    appearance: "Appearance",
    language: "Language",
    signOut: "Sign Out",
    signOutTitle: "Sign Out",
    signOutMessage: "You will need to sign in again to use Multica on this device.",
    workspaceLoadError: "Failed to load workspaces",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    langChinese: "中文",
    langEnglish: "English",
    profile: "Profile",
  },
  screens: {
    issue: "Issue",
    project: "Project",
    editProject: "Edit Project",
    editIssue: "Edit Issue",
    newProject: "New Project",
    newIssue: "New Issue",
    search: "Search",
    assignee: "Assignee",
    mention: "Mention",
    pins: "Pinned",
    issues: "Issues",
    projects: "Projects",
    agents: "Agents",
    settings: "Settings",
    profile: "Profile",
    notifications: "Notifications",
  },
  auth: {
    signInTitle: "Sign in to Multica",
    signInSubtitle: "Enter your email and we'll send you a verification code.",
    sendCode: "Send code",
    enterCode: "Enter verification code",
    codeSentTo: "We sent a 6-digit code to {email}",
    verify: "Verify",
    resendCode: "Resend code",
    useDifferentEmail: "Use a different email",
    sendCodeFailed: "Couldn't send the code. Try again.",
    verifyCodeFailed: "Couldn't verify the code. Try again.",
    resendCodeFailed: "Couldn't resend the code. Try again.",
    codeMismatch: "That code didn't match. Double-check and try again.",
    codeExpired: "That code has expired. Tap resend to get a new one.",
    tooManyAttempts: "Too many attempts. Wait a moment and try again.",
    sessionExpired: "Your session has expired. Please sign in again.",
    connectionError: "Can't reach Multica. Check your connection and retry.",
  },
  workspaceSelect: {
    signedInAs: "Signed in as",
    selectWorkspace: "Select a workspace",
    loadFailed: "Failed to load workspaces",
    noWorkspaces: "You don't belong to any workspaces yet. Contact your workspace admin to be invited.",
    signOut: "Sign out",
  },
  switchWorkspace: {
    title: "Switch workspace",
    confirm: (name) => `Switch to "${name}"?`,
    switch: "Switch",
    current: (name) => `${name}, current workspace`,
    switchTo: (name) => `Switch to ${name}`,
  },
  chat: {
    title: "Chats",
    noChats: "No chats yet.",
    untitled: "Untitled chat",
    archived: "archived",
    deleteConfirm: "Delete this chat?",
    deleteConfirmTitle: "Delete this chat?",
    noAgentSelected: "No agent selected",
    noAgents: "No agents in this workspace",
    chatArchived: "This chat is archived",
    agentNeedsRuntime: "Agent needs a runtime",
    runtimeRequired: "Runtime required",
    runtimeRequiredMsg: "Bind a runtime to this agent on web or desktop before sending a message.",
    newChat: "New chat",
    sessionsAndAgentPicker: "Sessions and agent picker",
    sessionActions: "Session actions",
    noAgentAvailable: "No agents available",
    noAgentAvailableMsg: "Add or enable an agent in More → Agents to start chatting.",
    agentDisconnected: (name) => `${name} may have just disconnected — your message will queue.`,
    agentOffline: (name) => `${name} is offline. Messages will wait until its runtime is back.`,
    agentNeedsRuntimeBanner: (name) => `${name} needs a runtime before it can run. Bind one on web or desktop.`,
    agent: "Agent",
    chat: "Chat",
    welcomeBack: "Welcome back to Multica",
    hiAgent: (name) => `Hi, I'm ${name}`,
    tryAsking: "Try asking",
    chatWithAgents: "Chat with your agents",
    theyKnow: "They know your workspace —",
    issuesProjectsSkills: "issues, projects, skills",
    askSummary: "Ask for a summary, plan your day, or hand off a small task.",
    suggestions: {
      listIssues: "List my open issues by priority",
      summarize: "Summarize what I did today",
      planNext: "Help me plan what to do next",
    },
    noTextReply: "The agent finished this turn without a text reply.",
    suggestedFollowups: "Suggested follow-ups",
    repliedIn: (ms) => `Replied in ${ms}`,
    finishedIn: (ms) => `Finished in ${ms}`,
    failedAfter: (ms) => `Failed after ${ms}`,
    showDetails: "Show details",
    stopAgent: "Stop agent",
    messagePlaceholder: "Message…",
    agentWorking: "Agent is working…",
    chatUnavailable: "Chat unavailable",
    stepCount: (n) => `${n} step${n === 1 ? "" : "s"}`,
  },
  agentEdit: {
    title: "Edit Agent",
    profile: "Profile",
    name: "Name",
    namePlaceholder: "Agent name",
    description: "Description",
    descriptionPlaceholder: "Briefly describe what this agent does",
    avatarUrl: "Avatar URL",
    avatarUrlPlaceholder: "https://...",
    instructions: "Instructions",
    instructionsPlaceholder: "Tell the agent what it should do…",
    instructionsSystemNote: "System agent instructions cannot be modified",
    runtimeConfig: "Runtime Config",
    runtime: "Runtime",
    model: "Model",
    thinkingLevel: "Thinking Level",
    serviceTier: "Service Tier",
    maxConcurrentTasks: "Max Concurrent Tasks",
    notBound: "Not Bound",
    noRuntimeSelected: "Not selected",
    noModelSelected: "Not selected",
    noThinkingLevel: "Default",
    noServiceTier: "Default",
    pickRuntime: "Pick Runtime",
    pickModel: "Pick Model",
    pickThinkingLevel: "Pick Thinking Level",
    pickServiceTier: "Pick Service Tier",
    loadingModels: "Loading models…",
    modelsUnavailable: "Unable to load models",
    permissions: "Permissions",
    permissionScope: "Visibility",
    scopePrivate: "Private",
    scopeWorkspace: "Workspace",
    scopeMembers: "Specific Members",
    permissionOwnerOnly: "Only the agent owner can change permissions",
    skills: "Skills",
    skillsSearchPlaceholder: "Search skills…",
    noSkills: "No skills in this workspace",
    noSkillsAssigned: "No skills assigned",
    envVars: "Environment Variables",
    envKey: "Key",
    envValue: "Value",
    envAdd: "Add Variable",
    envHidden: "Only the agent owner and workspace admins can view and edit",
    save: "Save",
    saving: "Saving…",
    saveSuccess: "Saved",
    saveError: "Failed to save",
    loadError: "Failed to load",
    agentNotFound: "Agent not found",
  },
  inbox: {
    title: "Inbox",
    actions: "Inbox actions",
    markAllRead: "Mark all read",
    archiveAllRead: "Archive all read",
    archiveCompleted: "Archive completed",
    archiveAll: "Archive all",
    archiveAllTitle: "Archive all?",
    archiveAllMsg: "This archives every inbox item, read or unread. You can still find them via the issue pages.",
    empty: "Inbox zero",
    emptyDesc: "When someone @mentions you, assigns an issue, or an agent finishes a task, it shows up here.",
    loadFailed: (msg) => `Failed to load inbox: ${msg}`,
    archive: "Archive",
  },
  issues: {
    myIssues: "My Issues",
    assignedToMe: "Assigned",
    createdByMe: "Created",
    agentsTab: "Agents",
    loadFailed: "Failed to load issues",
    noMatch: "No issues match the current filters.",
    noAssigned: "No issues assigned to you.",
    noCreated: "You haven't created any issues.",
    noAgentIssues: "No issues assigned to your agents or squads yet.",
    noIssuesInWorkspace: "No issues in this workspace.",
    noMemberIssues: "No issues assigned to a member.",
    noSquadIssues: "No issues assigned to agents or squads.",
    filter: "Filter",
    reset: "Reset",
    status: "Status",
    priority: "Priority",
    createIssue: "Create issue",
    newIssue: "New Issue",
    issueActions: "Issue actions",
    pin: "Pin",
    unpin: "Unpin",
    editDetails: "Edit details",
    deleteIssue: "Delete issue",
    deleteIssueTitle: "Delete issue?",
    deleteIssueMsg: (id) => `${id} and its comments, reactions, and attachments will be permanently deleted. This cannot be undone.`,
    notFound: "not found",
    loadFailedIssue: "Failed to load issue",
    titleField: "Title",
    titlePlaceholder: "Issue title",
    createFailed: "Failed to create issue",
    discardTitle: "Discard changes?",
    discardMsg: "Your edits to this issue will be lost.",
    saveFailed: "Failed to save",
    titleFieldLabel: "Title",
    descriptionFieldLabel: "Description",
    descriptionPlaceholder: "Description… (type @ to mention)",
    dueDate: "Due date",
    searchPeople: "Search people",
    searchProjects: "Search projects",
    searchLabels: "Search labels",
    referenceIssue: "Reference an issue",
    searchPeopleOrIssues: "Search people or issues",
    agentRuns: "Agent Runs",
    active: "Active",
    past: "Past",
    addReaction: "Add Reaction",
    run: "Run",
    runs: (count) => `Runs · ${count}`,
    working: "Working",
    agentWorkingOpenRuns: "Agent working — open runs",
    noDescription: "No description.",
    addComment: "Add a comment…",
    addCommentMention: "Add a comment, @ to mention…",
    descriptionMention: "Description… (type @ to mention)",
    failedToSend: "Couldn't send",
    retrySend: "Retry sending comment",
    discardFailed: "Discard failed comment",
    reply: "Reply",
    reactWith: "React…",
    copyLink: "Copy Link",
    resolveThread: "Resolve Thread",
    unresolveThread: "Unresolve Thread",
    deleteComment: "Delete comment",
    deleteCommentTitle: "Delete comment?",
    deleteCommentMsg: "This comment will be permanently deleted. Replies in the thread will also be removed. This cannot be undone.",
    removeMention: (name) => `Remove mention ${name}`,
    removeFile: (name) => `Remove ${name}`,
    openFile: (name) => `Open ${name}`,
    resolvedBy: "Resolved by",
    collapse: "Collapse",
    collapseResolved: "Collapse resolved thread",
    resolvedThreadLabel: (authors, total) => `Resolved by ${authors}, ${total} ${total === 1 ? "message" : "messages"}. Tap to expand.`,
    createIssueAccessibility: "Create issue",
    jumpToNew: (count) => `Jump to ${count} new ${count === 1 ? "message" : "messages"}`,
    scrollToLatest: "Scroll to latest",
    scrollToTop: "Scroll to top",
  },
  projects: {
    title: "Project",
    projectActions: "Project actions",
    pin: "Pin",
    unpin: "Unpin",
    editDetails: "Edit details",
    delete: "Delete",
    deleteTitle: "Delete project?",
    deleteMsg: "This cannot be undone. Issues in this project will become unassigned from any project.",
    notFound: "not found",
    loadFailed: "Failed to load project",
    newProject: "New project",
    noProjects: "No projects yet",
    noProjectsDesc: "Group related issues into a project to track progress and assign a lead.",
    createProject: "Create project",
    discardTitle: "Discard changes?",
    discardMsg: "Your edits to this project will be lost.",
    discardProject: "Discard project?",
    discardProjectMsg: "Your draft will be lost.",
    createFailed: "Failed to create project",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving…",
    creating: "Creating…",
    loading: "Loading…",
    iconEmoji: "Icon (emoji)",
    titleField: "Title",
    titlePlaceholder: "Project title",
    descriptionField: "Description",
    descriptionPlaceholder: "What is this project about?",
    statusField: "Status",
    priorityField: "Priority",
    leadField: "Lead",
    labelField: "Label",
    projectField: "Project",
    dueDateField: "Due date",
    unassigned: "Unassigned",
    unknown: "Unknown",
    attachResource: "Attach repository",
    attaching: "Attaching…",
    attach: "Attach",
    attachFailed: "Failed to attach resource",
    resourceUrl: "Repository URL",
    labelOptional: "Label (optional)",
    labelPlaceholder: "e.g. Backend",
    detachResource: "Detach resource?",
    detachResourceTitle: "Detach resource?",
    detach: "Detach",
    resources: "Resources",
    add: "Add",
    noResources: "No resources attached.",
    searchMembersOrAgents: "Search members or agents",
    relatedIssuesLoadFailed: "Failed to load issues",
    noIssues: "No issues yet.",
    lead: "Lead",
    status: "Status",
    priority: "Priority",
    needsRuntime: "Needs runtime",
    leaderNeedsRuntime: "Leader needs runtime",
    squad: "Squad",
    noMatches: "No matches.",
    noMembersOrAgents: "No members or agents in this workspace yet.",
    everyone: "Everyone",
    all: "All",
    member: "Member",
    agent: "Agent",
    noProject: "No project",
    noProjectsInWorkspace: "No projects in this workspace yet.\nCreate them on web.",
    searchIssuesAndProjects: "Search issues and projects",
    noResults: "No results",
    typeToSearch: "Type to search issues and projects.",
    noLabels: "No labels in this workspace yet.",
  },
  pins: {
    loadFailed: "Failed to load pins",
    noPins: "No pins yet. Pin an issue or project from its actions menu to surface it here.",
    noPinsDesc: "No pins yet. Pin an issue or project from its actions menu to surface it here.",
    unavailableIssue: "Issue",
    unavailableProject: "Project",
    unavailableTapToUnpin: (type) => `Unavailable ${type} — tap to unpin`,
  },
  profile: {
    takePhoto: "Take Photo",
    chooseFromLibrary: "Choose from Library",
    removePhoto: "Remove Photo",
    cancel: "Cancel",
    permissionNeeded: "Permission needed",
    cameraAccessRequired: "Camera access is required to take a photo.",
    imageTooLarge: "Image too large",
    imageTooLargeDesc: "Pick an image under 5 MB.",
    uploadFailed: "Upload failed",
    uploadFailedDesc: "Could not upload avatar.",
    removeFailed: "Remove failed",
    removeFailedDesc: "Could not remove avatar.",
    saveFailed: "Save failed",
    saveFailedDesc: "Could not update profile.",
    yourAvatar: "Your avatar",
    tapToChange: "Tap to change photo",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailReadOnly: "Email is set at sign-up and can't be changed here.",
    save: "Save",
    saving: "Saving…",
  },
  notifications: {
    assignments: "Assignments",
    assignmentsDesc: "When you're assigned an issue or removed as assignee.",
    statusChanges: "Status changes",
    statusChangesDesc: "When an issue's status changes.",
    comments: "Comments",
    commentsDesc: "New comments on issues you're subscribed to.",
    mentions: "Mentions",
    mentionsDesc: "When someone @mentions you, including @all and @squad.",
    issueUpdates: "Issue updates",
    issueUpdatesDesc: "Edits to title, description, labels, priority, or due date.",
    agentActivity: "Agent activity",
    agentActivityDesc: "When an agent picks up, runs, or completes a task.",
    loadFailed: "Failed to load notification preferences.",
    inboxTitle: "Inbox notifications",
    inboxDesc: "Which events show up in your inbox.",
    systemTitle: "System",
    systemDesc: "Multica-wide announcements and important account events.",
    systemNotifications: "System notifications",
    systemNotificationsDesc: "Account changes, security alerts, product updates.",
  },
  composer: {
    messagePlaceholder: "Message…",
    agentWorking: "Agent is working…",
    chatUnavailable: "Chat unavailable",
    cancelReply: "Cancel reply",
    mentionSomeone: "Mention someone",
    mentionSomeoneOrIssue: "Mention someone or an issue",
    uploadImage: "Upload image",
    uploadFile: "Upload file",
    send: "Send",
    fileTooLarge: "File too large",
    fileTooLargeDesc: "Files must be smaller than 100 MB.",
    uploadFailed: "Upload failed",
    replyingTo: (name) => `Replying to ${name}`,
  },
  markdown: {
    mention: "Mention someone",
    bulletList: "Bullet list",
    checklist: "Checklist",
    codeBlock: "Code block",
    quote: "Quote",
    attachImage: "Attach image",
    attachFile: "Attach file",
  },
  search: {
    recent: "Recent",
    projects: "Projects",
    issues: "Issues",
    cancelled: "Cancelled",
  },
  issueStatus: {
    backlog: "Backlog",
    todo: "Todo",
    in_progress: "In Progress",
    in_review: "In Review",
    done: "Done",
    blocked: "Blocked",
    cancelled: "Cancelled",
  },
  issuePriority: {
    none: "No priority",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  },
  projectStatus: {
    planned: "Planned",
    in_progress: "In Progress",
    paused: "Paused",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  projectPriority: {
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
    none: "No priority",
  },
  inboxDetail: {
    type: {
      issue_assigned: "Assigned",
      issue_subscribed: "Subscribed",
      unassigned: "Unassigned",
      assignee_changed: "Reassigned",
      status_changed: "Status changed",
      priority_changed: "Priority changed",
      start_date_changed: "Start date changed",
      due_date_changed: "Due date changed",
      new_comment: "New comment",
      mentioned: "Mentioned",
      review_requested: "Review requested",
      task_completed: "Task completed",
      task_failed: "Task failed",
      agent_blocked: "Agent blocked",
      agent_completed: "Agent completed",
      reaction_added: "Reaction added",
      quick_create_done: "Quick-create done",
      quick_create_failed: "Quick-create failed",
      quick_create_unconfirmed: "Quick-create needs a check",
    },
    setStatusTo: "Set status to",
    setPriorityTo: "Set priority to",
    assignedTo: (name) => `Assigned to ${name}`,
    removedAssignee: "Removed assignee",
    dueDateSetTo: (date) => `Set due date to ${date}`,
    removedDueDate: "Removed due date",
    reactedWith: (emoji) => `Reacted with ${emoji}`,
    createdByAgent: (id) => `Created with agent: ${id}`,
    failedDetail: (detail) => `Failed: ${detail}`,
  },
  activity: {
    createdIssue: "created the issue",
    statusChanged: (from, to) => `changed status: ${from} → ${to}`,
    priorityChanged: (from, to) => `changed priority: ${from} → ${to}`,
    selfAssigned: "self-assigned",
    removedAssignee: "removed assignee",
    assignedTo: (name) => `assigned to ${name}`,
    changedAssignee: "changed assignee",
    removedStartDate: "removed start date",
    setStartDate: (date) => `set start date to ${date}`,
    removedDueDate: "removed due date",
    setDueDate: (date) => `set due date to ${date}`,
    renamed: (from, to) => `renamed: "${from ?? "?"}" → "${to ?? "?"}"`,
    updatedDescription: "updated description",
    completedTasks: (n) => n > 1 ? `completed ${n} tasks` : "completed a task",
    failedTasks: (n) => n > 1 ? `failed ${n} tasks` : "failed a task",
    evaluatedWithAction: (reason) => `evaluated and took action: ${reason}`,
    evaluatedNoAction: "evaluated and took action",
    evaluatedNoActionReason: (reason) => `evaluated: no action needed (${reason})`,
    evaluationFailed: (reason) => `evaluation failed: ${reason}`,
    evaluationFailedNoReason: "evaluation failed",
    evaluatedSquadTrigger: "evaluated the squad trigger",
    status: {
      backlog: "Backlog",
      todo: "Todo",
      in_progress: "In Progress",
      in_review: "In Review",
      done: "Done",
      blocked: "Blocked",
      cancelled: "Cancelled",
    },
    priority: {
      none: "No priority",
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    },
  },
  runRow: {
    cancelTask: "Cancel task",
    cancelTaskTitle: "Cancel task?",
    cancelTaskMsg: "The agent will stop after the current step.",
    keepRunning: "Keep running",
    cancel: "Cancel",
    commentTask: "Comment task",
    autopilotRun: "Autopilot run",
    chatTask: "Chat task",
    quickCreate: "Quick create",
    task: "Task",
    status: {
      queued: "Queued",
      dispatched: "Starting",
      running: "Running",
      completed: "Done",
      failed: "Failed",
      cancelled: "Cancelled",
      waiting_local_directory: "Waiting for directory",
      queued_expired: "Expired in queue",
      runtime_offline: "Daemon offline",
      runtime_recovery: "Daemon restarted",
      timeout: "Task timed out",
      iteration_limit: "Hit the iteration limit",
      agent_blocked: "Waiting on human input",
      api_invalid_request: "Rejected by the model API",
      skill_bundle_unavailable: "Couldn't download the agent's skills",
      "agent_error.provider_auth_or_access": "Provider auth failed",
      "agent_error.provider_quota_limit": "Provider quota exhausted",
      "agent_error.provider_capacity_or_rate_limit": "Rate limited by provider",
      "agent_error.provider_server_error": "Provider server error",
      "agent_error.provider_network": "Network error reaching provider",
      "agent_error.process_failure": "Agent process crashed",
      "agent_error.empty_or_unparseable_output": "Agent returned no usable output",
      "agent_error.agent_timeout": "Agent timed out",
      "agent_error.context_overflow": "Context window exceeded",
      "agent_error.missing_config": "Missing API key or configuration",
      "agent_error.model_not_found_or_unavailable": "Model unavailable",
      "agent_error.runtime_version_unsupported": "Runner CLI version unsupported",
      "agent_error.runtime_missing_executable": "Runner CLI not installed",
      "agent_error.unknown": "Agent execution error",
      agent_error: "Agent execution error",
      codex_semantic_inactivity: "Codex semantic inactivity timeout",
      manual: "Cancelled by user",
    },
    failed: "Failed",
  },
  statusPill: {
    tools: {
      bash: "Running command",
      exec: "Running command",
      read: "Reading files",
      glob: "Reading files",
      grep: "Searching code",
      write: "Making edits",
      edit: "Making edits",
      multi_edit: "Making edits",
      multiedit: "Making edits",
      web_search: "Searching web",
      websearch: "Searching web",
    },
    retrying: "Retrying",
    offline: "Offline",
    reconnecting: "Reconnecting",
    queued: "Queued",
    starting: "Starting up",
    thinking: "Thinking",
    typing: "Typing",
    working: "Working",
  },
  timeAgo: {
    justNow: "Just now",
    minutesAgo: (n) => `${n}m ago`,
    hoursAgo: (n) => `${n}h ago`,
    daysAgo: (n) => `${n}d ago`,
    weeksAgo: (n) => `${n}w ago`,
  },
  code: {
    copyCode: "Copy code",
    codeCopied: "Code copied",
  },
};

export const translations: Record<Locale, TranslationDict> = { zh, en };

/**
 * Non-hook translation getter for lib/ pure functions.
 * Reads current locale from the Zustand store state directly.
 * Components that use lib/ functions calling getT() must also call useT()
 * to ensure they re-render on locale change.
 */
export function getT(): TranslationDict {
  const locale = useLanguageStore.getState().locale;
  return translations[locale];
}
