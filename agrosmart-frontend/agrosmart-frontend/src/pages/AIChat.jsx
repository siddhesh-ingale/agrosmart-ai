import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = "http://localhost:8080/api/v1/ai";

/*
|--------------------------------------------------------------------------
| Convert Gemini heading styles into normal Markdown headings
|--------------------------------------------------------------------------
|
| Gemini may return:
|
| ***Symptoms***
| **Treatment**
|
| We convert those standalone lines to:
|
| ### Symptoms
| ### Treatment
|
|--------------------------------------------------------------------------
*/

function normalizeMarkdown(text) {
    if (!text) return "";

    return text
        .replace(
            /^\s*\*\*\*(.+?)\*\*\*\s*$/gm,
            "### $1"
        )
        .replace(
            /^\s*\*\*(.+?)\*\*\s*$/gm,
            "### $1"
        );
}

/*
|--------------------------------------------------------------------------
| Markdown UI
|--------------------------------------------------------------------------
*/

const markdownComponents = {
    h1: ({ children }) => (
        <h1 className="text-xl md:text-2xl font-bold text-green-800 mt-2 mb-3">
            {children}
        </h1>
    ),

    h2: ({ children }) => (
        <h2 className="text-lg md:text-xl font-bold text-green-800 mt-4 mb-2">
            {children}
        </h2>
    ),

    h3: ({ children }) => (
        <h3 className="text-base md:text-lg font-bold text-green-700 mt-4 mb-2">
            {children}
        </h3>
    ),

    p: ({ children }) => (
        <p className="mb-3 last:mb-0 leading-6">
            {children}
        </p>
    ),

    strong: ({ children }) => (
        <strong className="font-bold text-gray-900">
            {children}
        </strong>
    ),

    em: ({ children }) => (
        <em className="italic">
            {children}
        </em>
    ),

    ul: ({ children }) => (
        <ul className="list-disc ml-5 mb-3 space-y-1">
            {children}
        </ul>
    ),

    ol: ({ children }) => (
        <ol className="list-decimal ml-5 mb-3 space-y-1">
            {children}
        </ol>
    ),

    li: ({ children }) => (
        <li className="leading-6 pl-1">
            {children}
        </li>
    ),

    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-green-400 pl-4 my-3 italic text-gray-600">
            {children}
        </blockquote>
    ),

    hr: () => (
        <hr className="my-4 border-gray-200" />
    ),

    code: ({ children }) => (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-green-700">
            {children}
        </code>
    ),

    a: ({ children, href }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 underline hover:text-green-800"
        >
            {children}
        </a>
    ),

    table: ({ children }) => (
        <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse border border-gray-200 text-sm">
                {children}
            </table>
        </div>
    ),

    th: ({ children }) => (
        <th className="border border-gray-200 bg-green-50 px-3 py-2 text-left font-semibold">
            {children}
        </th>
    ),

    td: ({ children }) => (
        <td className="border border-gray-200 px-3 py-2">
            {children}
        </td>
    ),
};

/*
|--------------------------------------------------------------------------
| AI TYPING MESSAGE
|--------------------------------------------------------------------------
*/

function TypingMessage({ text, onComplete }) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let index = 0;

        const formattedText = normalizeMarkdown(text);

        setDisplayedText("");

        /*
         * 6ms gives a faster typing effect.
         */
        const interval = setInterval(() => {
            if (index < formattedText.length) {
                index += 1;

                setDisplayedText(
                    formattedText.substring(0, index)
                );
            } else {
                clearInterval(interval);

                if (onComplete) {
                    onComplete();
                }
            }
        }, 6);

        return () => {
            clearInterval(interval);
        };
    }, [text, onComplete]);

    return (
        <div className="text-sm md:text-[15px] leading-6">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {displayedText}
            </ReactMarkdown>

            <span className="ml-1 text-green-600 animate-pulse">
                ▌
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| NORMAL AI MESSAGE
|--------------------------------------------------------------------------
*/

function AIMessage({ text }) {
    return (
        <div className="text-sm md:text-[15px] leading-6">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
            >
                {normalizeMarkdown(text)}
            </ReactMarkdown>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function AIChat() {
    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState("");
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [typingMessageId, setTypingMessageId] = useState(null);

    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | TOKEN
    |--------------------------------------------------------------------------
    */

    const getToken = () => {
        return localStorage.getItem("token");
    };

    /*
    |--------------------------------------------------------------------------
    | AUTH CHECK + LOAD HISTORY
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const token = getToken();

        if (!token) {
            navigate("/login", {
                replace: true,
                state: {
                    from: location.pathname,
                },
            });

            return;
        }

        loadHistory();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | LOAD HISTORY
    |--------------------------------------------------------------------------
    */

    const loadHistory = async () => {
        const token = getToken();

        if (!token) {
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/chat/history`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if ( response.status === 401 || response.status === 403 ) {
                localStorage.removeItem("token");

                navigate("/login", {
                    replace: true,
                    state: {
                        from: location.pathname,
                    },
                });

                return;
            }

            const text = await response.text();

            let data = [];

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = [];
                }
            }

            if (!response.ok) {
                throw new Error(
                    "Unable to load chat history."
                );
            }

            if (!Array.isArray(data)) {
                data = [];
            }

            /*
             * Newest conversation first.
             */
            const formatted = [...data]
                .reverse()
                .map((chat, index) => ({
                    id:
                        chat.id ??
                        `history-${index}-${Date.now()}`,

                    title:
                        chat.message ||
                        "New conversation",

                    messages: [
                        {
                            type: "user",
                            text: chat.message || "",
                        },
                        {
                            type: "ai",
                            text: chat.response || "",
                        },
                    ],
                }));

            setConversations(formatted);
            return 
            /*
             * Open newest chat.
             */
            // if (formatted.length > 0) {
            //     setSelectedChat(formatted[0]);
            // }

        } catch (error) {
            console.error(
                "Failed to load chat history:",
                error
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | SELECT CHAT
    |--------------------------------------------------------------------------
    */

    const selectChat = (chat) => {
        setSelectedChat(chat);
        setMessage("");
        setTypingMessageId(null);

        setTimeout(() => {
            textareaRef.current?.focus();
        }, 100);
    };

    /*
    |--------------------------------------------------------------------------
    | NEW CHAT
    |--------------------------------------------------------------------------
    */

    const newChat = () => {
        setSelectedChat(null);
        setMessage("");
        setTypingMessageId(null);

        setTimeout(() => {
            textareaRef.current?.focus();
        }, 100);
    };

    /*
    |--------------------------------------------------------------------------
    | AUTO SCROLL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [
        selectedChat,
        loading,
        typingMessageId,
    ]);

    /*
    |--------------------------------------------------------------------------
    | SEND MESSAGE
    |--------------------------------------------------------------------------
    */

    const sendMessage = async () => {
        if (!message.trim() || loading) {
            return;
        }

        const token = getToken();

        if (!token) {
            navigate("/login", {
                replace: true,
                state: {
                    from: location.pathname,
                },
            });

            return;
        }

        const userMessage = message.trim();

        setMessage("");
        setLoading(true);
        setTypingMessageId(null);

        /*
        |--------------------------------------------------------------------------
        | NEW CHAT
        |--------------------------------------------------------------------------
        */

        if (!selectedChat) {
            const temporaryChat = {
                id: `new-${Date.now()}`,

                title: userMessage,

                messages: [
                    {
                        type: "user",
                        text: userMessage,
                    },
                ],
            };

            setConversations((prev) => [
                temporaryChat,
                ...prev,
            ]);

            setSelectedChat(temporaryChat);

            try {
                const response = await fetch(
                    `${API_URL}/chat`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            message: userMessage,
                        }),
                    }
                );

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.removeItem("token");

                    navigate("/login", {
                        replace: true,
                        state: {
                            from: location.pathname,
                        },
                    });

                    return;
                }

                const text = await response.text();

                let data = {};

                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch {
                        data = {};
                    }
                }

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        data.error ||
                        "Unable to process your request."
                    );
                }

                const aiMessage = {
                    id: `ai-${Date.now()}`,
                    type: "ai",
                    text:
                        data.message ||
                        "I couldn't generate a response.",
                };

                /*
                 * Add AI message to current chat.
                 */
                setSelectedChat((prev) => ({
                    ...prev,

                    messages: [
                        ...(prev?.messages || []),
                        aiMessage,
                    ],
                }));

                /*
                 * Update sidebar.
                 */
                setConversations((prev) =>
                    prev.map((chat) =>
                        chat.id === temporaryChat.id
                            ? {
                                ...chat,

                                messages: [
                                    ...chat.messages,
                                    aiMessage,
                                ],
                            }
                            : chat
                    )
                );

                /*
                 * Start typing animation.
                 */
                setTypingMessageId(aiMessage.id);
            } catch (error) {
                console.error(
                    "AI chat error:",
                    error
                );

                const errorMessage = {
                    id: `error-${Date.now()}`,

                    type: "ai",

                    text:
                        "Sorry, I couldn't process your request right now. Please try again.",
                };

                setSelectedChat((prev) => ({
                    ...prev,

                    messages: [
                        ...(prev?.messages || []),
                        errorMessage,
                    ],
                }));

                setConversations((prev) =>
                    prev.map((chat) =>
                        chat.id === temporaryChat.id
                            ? {
                                ...chat,

                                messages: [
                                    ...chat.messages,
                                    errorMessage,
                                ],
                            }
                            : chat
                    )
                );
            } finally {
                setLoading(false);

                setTimeout(() => {
                    textareaRef.current?.focus();
                }, 100);
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | EXISTING CHAT
        |--------------------------------------------------------------------------
        */

        const currentChatId = selectedChat.id;

        const userChatMessage = {
            id: `user-${Date.now()}`,
            type: "user",
            text: userMessage,
        };

        /*
         * Immediately display user message.
         */
        setSelectedChat((prev) => ({
            ...prev,

            messages: [
                ...(prev?.messages || []),
                userChatMessage,
            ],
        }));

        /*
         * Update sidebar.
         */
        setConversations((prev) =>
            prev.map((chat) =>
                chat.id === currentChatId
                    ? {
                        ...chat,

                        messages: [
                            ...chat.messages,
                            userChatMessage,
                        ],
                    }
                    : chat
            )
        );

        try {
            const response = await fetch(
                `${API_URL}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        message: userMessage,
                    }),
                }
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");

                navigate("/login", {
                    replace: true,
                    state: {
                        from: location.pathname,
                    },
                });

                return;
            }

            const text = await response.text();

            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = {};
                }
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to process your request."
                );
            }

            const aiMessage = {
                id: `ai-${Date.now()}`,
                type: "ai",

                text:
                    data.message ||
                    "I couldn't generate a response.",
            };

            /*
             * Add AI response.
             */
            setSelectedChat((prev) => ({
                ...prev,

                messages: [
                    ...(prev?.messages || []),
                    aiMessage,
                ],
            }));

            /*
             * Update sidebar.
             */
            setConversations((prev) =>
                prev.map((chat) =>
                    chat.id === currentChatId
                        ? {
                            ...chat,

                            messages: [
                                ...chat.messages,
                                aiMessage,
                            ],
                        }
                        : chat
                )
            );

            /*
             * Start typing.
             */
            setTypingMessageId(aiMessage.id);
        } catch (error) {
            console.error(
                "AI chat error:",
                error
            );

            const errorMessage = {
                id: `error-${Date.now()}`,

                type: "ai",

                text:
                    "Sorry, I couldn't process your request right now. Please try again.",
            };

            setSelectedChat((prev) => ({
                ...prev,

                messages: [
                    ...(prev?.messages || []),
                    errorMessage,
                ],
            }));

            setConversations((prev) =>
                prev.map((chat) =>
                    chat.id === currentChatId
                        ? {
                            ...chat,

                            messages: [
                                ...chat.messages,
                                errorMessage,
                            ],
                        }
                        : chat
                )
            );
        } finally {
            setLoading(false);

            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | ENTER KEY
    |--------------------------------------------------------------------------
    */

    const handleKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();

            sendMessage();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | QUICK QUESTION
    |--------------------------------------------------------------------------
    */

    const askQuickQuestion = (question) => {
        setMessage(question);

        setTimeout(() => {
            textareaRef.current?.focus();
        }, 100);
    };

    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    const logout = () => {
        localStorage.removeItem("token");

        navigate("/", {
            replace: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="h-screen flex bg-white overflow-hidden">

            {/* =========================================================
                SIDEBAR
            ========================================================= */}

            <aside
                className={`
                    fixed md:relative
                    z-40
                    h-full
                    w-72
                    bg-gray-50
                    border-r border-gray-200
                    flex flex-col

                    transition-transform
                    duration-300
                    ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }
                    md:translate-x-0
                `}
            >

                {/* HEADER */}

                <div className="p-4">

                    <div className="
                        flex
                        items-center
                        justify-between
                        mb-4
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <div className="
                                w-10
                                h-10
                                rounded-xl
                                bg-green-100
                                flex
                                items-center
                                justify-center
                                text-xl
                            ">
                                🌱
                            </div>

                            <div>

                                <h1 className="
                                    font-bold
                                    text-gray-800
                                ">
                                    Agrosmart AI
                                </h1>

                                <p className="
                                    text-[10px]
                                    text-gray-500
                                ">
                                    Smart Farming Assistant
                                </p>

                            </div>

                        </div>

                        {/* MOBILE CLOSE */}

                        <button
                            onClick={() =>
                                setSidebarOpen(false)
                            }

                            className="
                                md:hidden
                                text-gray-500
                                hover:text-gray-800
                                text-xl
                            "
                        >
                            ✕
                        </button>

                    </div>

                    {/* NEW CHAT */}

                    <button
                        onClick={newChat}

                        className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-4
                            py-3
                            rounded-xl

                            border
                            border-gray-200
                            bg-white

                            hover:bg-green-50
                            hover:border-green-300
                            hover:shadow-sm

                            transition-all
                            duration-200

                            active:scale-[0.98]
                        "
                    >

                        <span className="
                            text-xl
                            text-green-600
                        ">
                            ＋
                        </span>

                        <span className="
                            font-semibold
                            text-gray-700
                        ">
                            New Chat
                        </span>

                    </button>

                </div>

                {/* =====================================================
                    HISTORY
                ===================================================== */}

                <div className="
                    flex-1
                    overflow-y-auto
                    px-3
                ">

                    <div className="
                        flex
                        items-center
                        justify-between
                        px-3
                        py-2
                    ">

                        <p className="
                            text-xs
                            font-semibold
                            text-gray-400
                            uppercase
                            tracking-wide
                        ">
                            Recent Chats
                        </p>

                        {conversations.length > 0 && (
                            <span className="
                                text-[10px]
                                text-gray-400
                            ">
                                {conversations.length}
                            </span>
                        )}

                    </div>

                    {conversations.length === 0 && (

                        <div className="
                            text-center
                            px-4
                            py-8
                        ">

                            <div className="
                                text-3xl
                                mb-2
                            ">
                                💬
                            </div>

                            <p className="
                                text-sm
                                text-gray-400
                            ">
                                No previous conversations
                            </p>

                        </div>

                    )}

                    <div className="space-y-1">

                        {conversations.map((chat) => (

                            <button
                                key={chat.id}

                                onClick={() =>
                                    selectChat(chat)
                                }

                                className={`
                                    group
                                    w-full
                                    text-left
                                    px-3
                                    py-3
                                    rounded-xl

                                    transition-all
                                    duration-200

                                    ${
                                        selectedChat?.id ===
                                        chat.id
                                            ? "bg-green-100 text-green-800"
                                            : "text-gray-600 hover:bg-white hover:shadow-sm"
                                    }
                                `}
                            >

                                <div className="
                                    flex
                                    items-start
                                    gap-3
                                ">

                                    <div className={`
                                        mt-0.5
                                        w-7
                                        h-7
                                        rounded-lg
                                        flex
                                        items-center
                                        justify-center
                                        flex-shrink-0

                                        ${
                                            selectedChat?.id ===
                                            chat.id
                                                ? "bg-green-200"
                                                : "bg-gray-100 group-hover:bg-green-50"
                                        }
                                    `}>
                                        💬
                                    </div>

                                    <div className="min-w-0">

                                        <p className={`
                                            text-sm
                                            font-medium
                                            truncate

                                            ${
                                                selectedChat?.id ===
                                                chat.id
                                                    ? "text-green-800"
                                                    : "text-gray-700"
                                            }
                                        `}>
                                            {chat.title}
                                        </p>

                                        <p className="
                                            text-[11px]
                                            text-gray-400
                                            mt-1
                                        ">
                                            View conversation
                                        </p>

                                    </div>

                                </div>

                            </button>

                        ))}

                    </div>

                </div>

                {/* =====================================================
                    LOGOUT
                ===================================================== */}

                <div className="
                    p-3
                    border-t
                    border-gray-200
                ">

                    <button
                        onClick={logout}

                        className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-3
                            py-3
                            rounded-xl

                            text-gray-600

                            hover:bg-red-50
                            hover:text-red-600

                            transition-all
                            duration-200
                        "
                    >

                        <span>🚪</span>

                        <span className="
                            text-sm
                            font-medium
                        ">
                            Logout
                        </span>

                    </button>

                </div>

            </aside>

            {/* =========================================================
                MOBILE OVERLAY
            ========================================================= */}

            {sidebarOpen && (
                <div
                    onClick={() =>
                        setSidebarOpen(false)
                    }

                    className="
                        fixed
                        inset-0
                        bg-black/20
                        z-30
                        md:hidden
                    "
                />
            )}

            {/* =========================================================
                MAIN
            ========================================================= */}

            <div className="
                flex-1
                flex
                flex-col
                min-w-0
            ">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <header className="
                    h-16
                    border-b
                    border-gray-200
                    bg-white

                    flex
                    items-center

                    px-4

                    flex-shrink-0
                ">

                    <button
                        onClick={()=>{
                            setSidebarOpen(!sidebarOpen)
                        }
                        }
                        className="
                            mr-3
                            p-2
                            rounded-lg
                            hover:bg-gray-100
                            text-gray-600

                            transition
                            active:scale-90
                        "
                    >
                        ☰
                    </button>

                    <div className="min-w-0">

                        <h2 className="
                            font-semibold
                            text-gray-800
                            truncate
                            max-w-md
                        ">
                            {selectedChat
                                ? selectedChat.title
                                : "Agrosmart AI"}
                        </h2>

                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <span className="
                                w-2
                                h-2
                                rounded-full
                                bg-green-500
                                animate-pulse
                            "/>

                            <span className="
                                text-xs
                                text-gray-400
                            ">
                                Agricultural Assistant
                            </span>

                        </div>

                    </div>

                </header>

                {/* =====================================================
                    CHAT AREA
                ===================================================== */}

                <main ref={chatContainerRef} className=" flex-1 overflow-y-auto bg-gradient-to-br from-green-50/40 via-white to-emerald-50/40 " >

                    <div className="
                        max-w-4xl
                        mx-auto
                        px-4
                        py-8
                    ">

                        {/* =================================================
                            WELCOME SCREEN
                        ================================================= */}

                        {!selectedChat && (

                            <div className="
                                flex
                                flex-col
                                items-center
                                text-center

                                pt-8
                                md:pt-16
                            ">

                                <div className="
                                    w-20
                                    h-20
                                    rounded-2xl
                                    bg-green-100

                                    flex
                                    items-center
                                    justify-center

                                    text-5xl
                                    shadow-sm

                                    animate-pulse
                                ">
                                    🌱
                                </div>

                                <h2 className="
                                    text-2xl
                                    md:text-3xl
                                    font-bold
                                    text-gray-800
                                    mt-5
                                ">
                                    How can I help you today?
                                </h2>

                                <p className="
                                    text-gray-500
                                    mt-2
                                    max-w-lg
                                ">
                                    Ask Agrosmart AI about crops,
                                    soil, diseases, pests,
                                    irrigation or farming practices.
                                </p>

                                {/* QUICK QUESTIONS */}

                                <div className="
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-2
                                    gap-3

                                    mt-8

                                    w-full
                                    max-w-2xl
                                ">

                                    <button
                                        onClick={() =>
                                            askQuickQuestion(
                                                "Which crop is suitable for my soil?"
                                            )
                                        }

                                        className="
                                            bg-white
                                            border
                                            border-gray-200
                                            rounded-xl
                                            p-4
                                            text-left

                                            hover:border-green-300
                                            hover:shadow-md

                                            transition-all
                                            duration-200
                                        "
                                    >

                                        <p className="
                                            font-semibold
                                            text-gray-700
                                        ">
                                            🌾 Crop Recommendation
                                        </p>

                                        <p className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        ">
                                            Find a suitable crop
                                        </p>

                                    </button>

                                    <button
                                        onClick={() =>
                                            askQuickQuestion(
                                                "What should I do if my crop leaves are turning yellow?"
                                            )
                                        }

                                        className="
                                            bg-white
                                            border
                                            border-gray-200
                                            rounded-xl
                                            p-4
                                            text-left

                                            hover:border-green-300
                                            hover:shadow-md

                                            transition-all
                                            duration-200
                                        "
                                    >

                                        <p className="
                                            font-semibold
                                            text-gray-700
                                        ">
                                            🍃 Yellow Leaves
                                        </p>

                                        <p className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        ">
                                            Find possible causes
                                        </p>

                                    </button>

                                    <button
                                        onClick={() =>
                                            askQuickQuestion(
                                                "How can I prevent common crop diseases?"
                                            )
                                        }

                                        className="
                                            bg-white
                                            border
                                            border-gray-200
                                            rounded-xl
                                            p-4
                                            text-left

                                            hover:border-green-300
                                            hover:shadow-md

                                            transition-all
                                            duration-200
                                        "
                                    >

                                        <p className="
                                            font-semibold
                                            text-gray-700
                                        ">
                                            🛡️ Disease Prevention
                                        </p>

                                        <p className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        ">
                                            Protect your crops
                                        </p>

                                    </button>

                                    <button
                                        onClick={() =>
                                            askQuickQuestion(
                                                "How can I improve the health of my soil?"
                                            )
                                        }

                                        className="
                                            bg-white
                                            border
                                            border-gray-200
                                            rounded-xl
                                            p-4
                                            text-left

                                            hover:border-green-300
                                            hover:shadow-md

                                            transition-all
                                            duration-200
                                        "
                                    >

                                        <p className="
                                            font-semibold
                                            text-gray-700
                                        ">
                                            🌱 Soil Health
                                        </p>

                                        <p className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        ">
                                            Improve soil condition
                                        </p>

                                    </button>

                                </div>

                            </div>

                        )}

                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        {selectedChat && (

                            <div className="space-y-6">

                                {selectedChat.messages.map(
                                    (chat, index) => {

                                        const messageId =
                                            chat.id ||
                                            `${selectedChat.id}-${index}`;

                                        const isTyping =
                                            chat.type === "ai" &&
                                            messageId ===
                                                typingMessageId;

                                        return (

                                            <div
                                                key={messageId}

                                                className={`
                                                    flex
                                                    items-start
                                                    gap-3

                                                    animate-[fadeIn_0.3s_ease-out]

                                                    ${
                                                        chat.type ===
                                                        "user"
                                                            ? "justify-end"
                                                            : "justify-start"
                                                    }
                                                `}
                                            >

                                                {/* AI ICON */}

                                                {chat.type === "ai" && (

                                                    <div className="
                                                        flex-shrink-0

                                                        w-9
                                                        h-9

                                                        rounded-xl

                                                        bg-green-100

                                                        flex
                                                        items-center
                                                        justify-center
                                                    ">
                                                        🌱
                                                    </div>

                                                )}

                                                {/* MESSAGE BUBBLE */}

                                                <div
                                                    className={`
                                                        max-w-[90%]
                                                        md:max-w-[78%]

                                                        rounded-2xl

                                                        px-4
                                                        py-3

                                                        shadow-sm

                                                        ${
                                                            chat.type ===
                                                            "user"

                                                                ? "bg-green-600 text-white rounded-br-md"

                                                                : "bg-white text-gray-700 border border-gray-100 rounded-bl-md"
                                                        }
                                                    `}
                                                >

                                                    {/* USER */}
                                                    {chat.type ===
                                                    "user" ? (
                                                        <p className="
                                                            text-sm
                                                            md:text-[15px]

                                                            leading-6

                                                            whitespace-pre-wrap
                                                        ">
                                                            {chat.text}
                                                        </p>

                                                    ) : isTyping ? (

                                                        <TypingMessage
                                                            text={
                                                                chat.text
                                                            }

                                                            onComplete={() =>
                                                                setTypingMessageId(
                                                                    null
                                                                )
                                                            }
                                                        />
                                                    ) : (

                                                        <AIMessage
                                                            text={
                                                                chat.text
                                                            }
                                                        />

                                                    )}

                                                </div>

                                                {/* USER ICON */}

                                                {chat.type ===
                                                    "user" && (

                                                    <div className="
                                                        flex-shrink-0

                                                        w-9
                                                        h-9

                                                        rounded-xl

                                                        bg-green-600
                                                        text-white

                                                        flex
                                                        items-center
                                                        justify-center

                                                        text-xs
                                                        font-bold
                                                    ">
                                                        You
                                                    </div>

                                                )}

                                            </div>
                                        );
                                    }
                                )}

                                {/* =================================================
                                    THINKING
                                ================================================= */}

                                {loading && (

                                    <div className="
                                        flex
                                        items-start
                                        gap-3

                                        animate-[fadeIn_0.3s_ease-out]
                                    ">

                                        <div className="
                                            w-9
                                            h-9
                                            rounded-xl

                                            bg-green-100

                                            flex
                                            items-center
                                            justify-center
                                        ">
                                            🌱
                                        </div>

                                        <div className="
                                            bg-white

                                            border
                                            border-gray-100

                                            rounded-2xl

                                            px-5
                                            py-4

                                            shadow-sm
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                gap-1
                                            ">

                                                <span className="
                                                    text-sm
                                                    text-gray-500
                                                    mr-2
                                                ">
                                                    Thinking
                                                </span>

                                                <span className="
                                                    w-1.5
                                                    h-1.5
                                                    rounded-full
                                                    bg-green-500
                                                    animate-bounce
                                                "/>

                                                <span className="
                                                    w-1.5
                                                    h-1.5
                                                    rounded-full
                                                    bg-green-500
                                                    animate-bounce
                                                    [animation-delay:150ms]
                                                "/>

                                                <span className="
                                                    w-1.5
                                                    h-1.5
                                                    rounded-full
                                                    bg-green-500
                                                    animate-bounce
                                                    [animation-delay:300ms]
                                                "/>

                                            </div>

                                        </div>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </main>

                {/* =====================================================
                    INPUT AREA
                ===================================================== */}

                <footer className="
                    bg-white
                    border-t
                    border-gray-200
                ">

                    <div className="
                        max-w-4xl
                        mx-auto
                        px-4
                        py-4
                    ">

                        <div className="
                            flex
                            items-end
                            gap-2

                            bg-gray-50

                            border
                            border-gray-200

                            rounded-2xl

                            p-2

                            focus-within:border-green-400
                            focus-within:ring-2
                            focus-within:ring-green-100

                            transition
                        ">

                            <textarea
                                ref={textareaRef}

                                value={message}

                                onChange={(e) =>
                                    setMessage(
                                        e.target.value
                                    )
                                }

                                onKeyDown={
                                    handleKeyDown
                                }

                                placeholder="Ask Agrosmart AI..."
                                rows="1"

                                disabled={loading}

                                className="
                                    flex-1

                                    bg-transparent

                                    px-3
                                    py-2.5

                                    resize-none
                                    outline-none

                                    text-gray-700

                                    placeholder-gray-400

                                    max-h-32

                                    disabled:opacity-50
                                "
                            />

                            <button
                                onClick={sendMessage}

                                disabled={
                                    loading ||
                                    !message.trim()
                                }

                                className="
                                    flex-shrink-0

                                    w-11
                                    h-11

                                    rounded-xl

                                    bg-green-600

                                    hover:bg-green-700

                                    text-white

                                    flex
                                    items-center
                                    justify-center

                                    transition-all
                                    duration-200

                                    hover:scale-105
                                    active:scale-90

                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                "
                            >

                                {loading ? (

                                    <span className="
                                        w-5
                                        h-5

                                        border-2
                                        border-white
                                        border-t-transparent

                                        rounded-full

                                        animate-spin
                                    " />

                                ) : (

                                    <span className="text-lg">
                                        ➤
                                    </span>

                                )}

                            </button>

                        </div>

                        <p className="
                            text-[11px]
                            text-gray-400
                            text-center
                            mt-2
                        ">
                            Agrosmart AI provides general agricultural
                            guidance. For serious crop problems or
                            chemical decisions, consult a qualified
                            agricultural expert.
                        </p>

                    </div>

                </footer>

            </div>

            {/* =========================================================
                ANIMATION
            ========================================================= */}

            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(8px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>

        </div>
    );
}