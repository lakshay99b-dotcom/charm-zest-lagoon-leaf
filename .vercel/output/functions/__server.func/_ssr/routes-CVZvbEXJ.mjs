import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Check, c as ArrowLeft, i as Clock3, n as RotateCcw, o as BookOpen, r as LoaderCircle, s as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as slugifyConcept, t as cn } from "./utils-DGLU3z9w.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CVZvbEXJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppHeader({ status, onHome }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-20 border-b border-border/80 bg-bg/90 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-14 max-w-5xl items-center justify-between px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onHome,
				className: "flex items-center gap-2.5 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-8 items-center justify-center rounded-md bg-accent text-accent-fg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
						className: "size-4",
						strokeWidth: 2
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-lg font-medium tracking-tight",
					children: "Studania"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-[50%] truncate text-sm text-muted",
				children: status ?? "Ready"
			})]
		})
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var generateStudyPack = createServerFn({ method: "POST" }).validator((input) => {
	const concept = input.concept.trim().slice(0, 120);
	if (concept.length < 2) throw new Error("Enter a concept to study");
	return { concept };
}).handler(createSsrRpc("c2bc800b0b448b7278600d25f50d142a04002b792847e4402fc241fc55621bfb"));
var generateMoreQuestions = createServerFn({ method: "POST" }).validator((input) => ({
	title: input.title.trim().slice(0, 120),
	existing: input.existing.slice(0, 20)
})).handler(createSsrRpc("49eba8f2dc160a479290eb1ce8ad817e2da795de0df9a2cbe1d2afc40ecf9452"));
var evaluateTeachback = createServerFn({ method: "POST" }).validator((input) => {
	const explanation = input.explanation.trim();
	if (explanation.length < 40) throw new Error("Write a fuller explanation first");
	return {
		title: input.title.trim().slice(0, 120),
		keyPoints: input.keyPoints.slice(0, 10),
		explanation: explanation.slice(0, 4e3)
	};
}).handler(createSsrRpc("b2d600e7bcdc4a9edc5d6ce9f25be10c67707d59b87fb616b72dfc560a7a0297"));
var diagnoseMistake = createServerFn({ method: "POST" }).validator((input) => ({
	title: input.title.trim().slice(0, 120),
	question: input.question.slice(0, 500),
	options: input.options.slice(0, 4),
	chosen: input.chosen.slice(0, 300),
	correct: input.correct.slice(0, 300)
})).handler(createSsrRpc("2ead3a79afc1c3219bd00665283ba2f3705802a525e87034d7e27489ad43c9a6"));
var useStudyStore = create()(persist((set) => ({
	packs: {},
	progress: {},
	recents: [],
	savePack: (pack) => set((state) => ({
		packs: {
			...state.packs,
			[pack.slug]: pack
		},
		recents: [pack.slug, ...state.recents.filter((s) => s !== pack.slug)].slice(0, 12),
		progress: {
			...state.progress,
			[pack.slug]: state.progress[pack.slug] ?? {
				slug: pack.slug,
				title: pack.title,
				cardsReviewed: 0,
				questionsAttempted: 0,
				questionsCorrect: 0,
				masteryScore: null,
				lastStudied: Date.now()
			}
		}
	})),
	appendQuestions: (slug, pack) => set((state) => ({ packs: {
		...state.packs,
		[slug]: pack
	} })),
	touchProgress: (slug, title, patch) => set((state) => {
		const prev = state.progress[slug] ?? {
			slug,
			title,
			cardsReviewed: 0,
			questionsAttempted: 0,
			questionsCorrect: 0,
			masteryScore: null,
			lastStudied: Date.now()
		};
		return {
			progress: {
				...state.progress,
				[slug]: {
					...prev,
					title,
					lastStudied: Date.now(),
					...patch
				}
			},
			recents: [slug, ...state.recents.filter((s) => s !== slug)].slice(0, 12)
		};
	}),
	clearAll: () => set({
		packs: {},
		progress: {},
		recents: []
	})
}), { name: "studania-v1" }));
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[opacity,transform,background-color,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-elevated text-fg shadow-border hover:bg-surface",
			ghost: "text-muted hover:bg-surface hover:text-fg",
			outline: "border border-border bg-transparent text-fg hover:bg-surface"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Badge({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted", className),
		children
	});
}
function Progress({ value, className }) {
	const clamped = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-1.5 w-full overflow-hidden rounded-full bg-border", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-accent transition-[width] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
			style: { width: `${clamped}%` }
		})
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-40 w-full rounded-xl border border-border bg-elevated px-4 py-3 text-base text-fg placeholder:text-subtle outline-none transition-[box-shadow,border-color] duration-150", "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20", className),
		...props
	});
}
var TABS = [
	{
		id: "learn",
		label: "Learn"
	},
	{
		id: "revise",
		label: "Revise"
	},
	{
		id: "practise",
		label: "Practise"
	},
	{
		id: "mastery",
		label: "Mastery"
	}
];
function StudyWorkspace({ pack, onBack, onOpenRelated }) {
	const [tab, setTab] = (0, import_react.useState)("learn");
	const touchProgress = useStudyStore((s) => s.touchProgress);
	const progress = useStudyStore((s) => s.progress[pack.slug]);
	const mastery = progress?.masteryScore;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onBack,
				className: "mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "All concepts"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-medium tracking-tight text-fg sm:text-4xl",
					children: pack.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-muted",
					children: pack.summary
				})] }), typeof mastery === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full sm:w-40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 text-xs font-medium uppercase tracking-wide text-subtle",
							children: "Mastery"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: mastery }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm tabular-nums text-muted",
							children: [mastery, "%"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 flex gap-1 overflow-x-auto border-b border-border",
				children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(item.id),
					className: cn("min-h-11 shrink-0 px-4 text-sm font-medium transition-colors duration-150", tab === item.id ? "border-b-2 border-accent text-fg" : "border-b-2 border-transparent text-muted hover:text-fg"),
					children: item.label
				}, item.id))
			}),
			tab === "learn" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LearnPanel, {
				pack,
				onOpenRelated
			}),
			tab === "revise" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevisePanel, {
				pack,
				onReviewed: () => touchProgress(pack.slug, pack.title, { cardsReviewed: (progress?.cardsReviewed ?? 0) + 1 })
			}),
			tab === "practise" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PractisePanel, { pack }),
			tab === "mastery" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MasteryPanel, { pack })
		]
	});
}
function Panel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "rounded-xl bg-elevated p-5 shadow-border sm:p-6",
		children
	});
}
function LearnPanel({ pack, onOpenRelated }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 text-xl font-medium",
				children: "Explanation"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3 text-[1.05rem] leading-relaxed text-fg",
				children: pack.explanation.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p }, p.slice(0, 24)))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 text-xl font-medium",
				children: "Key points"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2.5",
				children: pack.keyPoints.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-3 text-[1.05rem] leading-relaxed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1.5 shrink-0 rounded-full bg-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: point })]
				}, point))
			})] }),
			pack.examples.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xl font-medium",
				children: ex.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "leading-relaxed text-fg",
				children: ex.body
			})] }, ex.title)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 text-xl font-medium",
				children: "Common misconceptions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: pack.misconceptions.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-bad",
							children: "Not this"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-fg",
							children: m.myth
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm font-medium text-ok",
							children: "Instead"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-fg",
							children: m.truth
						})
					]
				}, m.myth))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-xl font-medium",
				children: "Study next"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: pack.related.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onOpenRelated(item),
					className: "min-h-11 rounded-full border border-border bg-surface px-3.5 text-sm text-fg hover:border-accent/40",
					children: item
				}, item))
			})] })
		]
	});
}
function RevisePanel({ pack, onReviewed }) {
	const [index, setIndex] = (0, import_react.useState)(0);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const card = pack.flashcards[index];
	function go(next) {
		setIndex(next);
		setFlipped(false);
		onReviewed();
	}
	if (!card) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-3 text-xl font-medium",
			children: "Quick summary"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "leading-relaxed",
			children: pack.summary
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-medium",
					children: "Flashcards"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm tabular-nums text-muted",
					children: [
						index + 1,
						" / ",
						pack.flashcards.length
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setFlipped((v) => !v),
				className: "flex min-h-48 w-full flex-col items-center justify-center rounded-lg bg-surface px-6 py-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-lg font-medium leading-snug",
					children: flipped ? card.back : card.front
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-subtle",
					children: flipped ? "Answer" : "Tap to reveal"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					className: "flex-1",
					disabled: index === 0,
					onClick: () => go(index - 1),
					children: "Previous"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					disabled: index >= pack.flashcards.length - 1,
					onClick: () => go(index + 1),
					children: "Next"
				})]
			})
		] })]
	});
}
function PractisePanel({ pack }) {
	const savePack = useStudyStore((s) => s.savePack);
	const touchProgress = useStudyStore((s) => s.touchProgress);
	const progress = useStudyStore((s) => s.progress[pack.slug]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [chosen, setChosen] = (0, import_react.useState)(null);
	const [checked, setChecked] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [diagnosis, setDiagnosis] = (0, import_react.useState)(null);
	const question = pack.questions[index];
	const correct = chosen === question?.answer;
	async function onCheck() {
		if (chosen === null || !question) return;
		setChecked(true);
		setDiagnosis(null);
		touchProgress(pack.slug, pack.title, {
			questionsAttempted: (progress?.questionsAttempted ?? 0) + 1,
			questionsCorrect: (progress?.questionsCorrect ?? 0) + (chosen === question.answer ? 1 : 0)
		});
	}
	async function onDiagnose() {
		if (!question || chosen === null) return;
		setBusy(true);
		setError(null);
		try {
			const result = await diagnoseMistake({ data: {
				title: pack.title,
				question: question.q,
				options: question.options,
				chosen: question.options[chosen],
				correct: question.options[question.answer]
			} });
			setDiagnosis(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not diagnose that answer");
		} finally {
			setBusy(false);
		}
	}
	async function onMore() {
		setBusy(true);
		setError(null);
		try {
			const extra = await generateMoreQuestions({ data: {
				title: pack.title,
				existing: pack.questions.map((q) => q.q)
			} });
			savePack({
				...pack,
				questions: [...pack.questions, ...extra]
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not generate more questions");
		} finally {
			setBusy(false);
		}
	}
	function next() {
		setIndex((i) => Math.min(i + 1, pack.questions.length - 1));
		setChosen(null);
		setChecked(false);
		setDiagnosis(null);
		setError(null);
	}
	if (!question) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "No questions yet."
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-medium",
				children: "Practice"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm tabular-nums text-muted",
				children: [
					index + 1,
					" / ",
					pack.questions.length
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-5 text-lg font-medium leading-snug",
			children: question.q
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: question.options.map((opt, i) => {
				const selected = chosen === i;
				const showMark = checked && (i === question.answer || selected);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: cn("flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-150", selected && !checked && "border-accent bg-surface", checked && i === question.answer && "border-ok bg-ok/8", checked && selected && i !== question.answer && "border-bad bg-bad/8", !selected && !checked && "border-border hover:border-accent/30"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "radio",
							name: "practice-option",
							className: "mt-1",
							checked: selected,
							disabled: checked,
							onChange: () => setChosen(i)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 leading-snug",
							children: opt
						}),
						showMark && i === question.answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 size-4 text-ok" })
					]
				}, opt);
			})
		}),
		checked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("mt-5 rounded-lg p-4", correct ? "bg-ok/10 text-fg" : "bg-bad/10 text-fg"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: correct ? "Correct" : "Not quite"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 leading-relaxed",
					children: question.explanation
				}),
				!correct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: question.misconceptionIfWrong
				})
			]
		}),
		diagnosis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-lg bg-surface p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-accent",
					children: diagnosis.likelyMisconception
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 leading-relaxed",
					children: diagnosis.diagnosis
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 leading-relaxed",
					children: diagnosis.microLesson
				})
			]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-bad",
			children: error
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 flex flex-col gap-3 sm:flex-row",
			children: !checked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "sm:min-w-40",
				disabled: chosen === null,
				onClick: onCheck,
				children: "Check answer"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [index < pack.questions.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "sm:min-w-40",
				onClick: next,
				children: ["Next question", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "sm:min-w-40",
				disabled: busy,
				onClick: onMore,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Generate more"]
			}), !correct && !diagnosis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "secondary",
				disabled: busy,
				onClick: onDiagnose,
				children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Diagnose this mistake"]
			})] })
		})
	] });
}
function MasteryPanel({ pack }) {
	const touchProgress = useStudyStore((s) => s.touchProgress);
	const [text, setText] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const keywords = (0, import_react.useMemo)(() => pack.keyPoints.slice(0, 4).map((p) => p.split(" ").slice(0, 4).join(" ")), [pack.keyPoints]);
	async function onEvaluate() {
		setBusy(true);
		setError(null);
		try {
			const graded = await evaluateTeachback({ data: {
				title: pack.title,
				keyPoints: pack.keyPoints,
				explanation: text
			} });
			setResult(graded);
			touchProgress(pack.slug, pack.title, { masteryScore: graded.score });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not evaluate that explanation");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-xl font-medium",
				children: "Teach it back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-4 text-muted",
				children: [
					"Explain ",
					pack.title,
					" as if teaching a classmate. Cover the mechanism, not just the name."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-2",
				children: keywords.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: k }, k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: text,
				onChange: (e) => setText(e.target.value),
				placeholder: "Start with what it is, then how it works, then why it matters..."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: busy || text.trim().length < 40,
					onClick: onEvaluate,
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null, "Evaluate"]
				}), result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					onClick: () => {
						setResult(null);
						setText("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" }), "Try again"]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-bad",
				children: error
			})
		] }), result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-medium",
					children: "Feedback"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl tabular-nums",
					children: result.score
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: result.score,
				className: "mb-4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium uppercase tracking-wide text-muted",
				children: result.verdict.replace("_", " ")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 leading-relaxed",
				children: result.feedback
			}),
			result.covered.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-ok",
					children: "Covered"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1 list-disc space-y-1 pl-5 text-sm",
					children: result.covered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
				})]
			}),
			result.missing.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-warn",
					children: "Missing"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1 list-disc space-y-1 pl-5 text-sm",
					children: result.missing.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 rounded-lg bg-surface p-3 text-sm leading-relaxed",
				children: result.nextHint
			})
		] })]
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-12 w-full rounded-lg border border-border bg-elevated px-4 text-base text-fg placeholder:text-subtle outline-none transition-[box-shadow,border-color] duration-150", "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20", className),
		...props
	});
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("animate-pulse rounded-lg bg-border/70", className) });
}
var SUGGESTIONS = [
	"Photosynthesis",
	"Quadratic equations",
	"Newton's laws",
	"Supply and demand",
	"Cell division",
	"Binary search",
	"Ohm's law",
	"French Revolution"
];
function Home() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const packs = useStudyStore((s) => s.packs);
	const recents = useStudyStore((s) => s.recents);
	const savePack = useStudyStore((s) => s.savePack);
	(0, import_react.useEffect)(() => {
		setHydrated(true);
	}, []);
	async function openConcept(raw) {
		const concept = raw.trim();
		if (concept.length < 2) return;
		const slug = slugifyConcept(concept);
		const cached = packs[slug] ?? Object.values(packs).find((p) => p.title.toLowerCase() === concept.toLowerCase());
		if (cached) {
			setActive(cached);
			setError(null);
			return;
		}
		setLoading(true);
		setError(null);
		setActive(null);
		try {
			const pack = await generateStudyPack({ data: { concept } });
			savePack(pack);
			setActive(pack);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not build that study pack");
		} finally {
			setLoading(false);
		}
	}
	if (active) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, {
			status: active.title,
			onHome: () => setActive(null)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudyWorkspace, {
			pack: packs[active.slug] ?? active,
			onBack: () => setActive(null),
			onOpenRelated: (concept) => void openConcept(concept)
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppHeader, { status: loading ? "Building your pack" : "Ready" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-5xl px-4 pb-16 pt-10 sm:pt-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium uppercase tracking-[0.14em] text-muted",
					children: "Study any concept"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 max-w-xl text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl",
					children: "Learn it. Revise it. Practise until it sticks."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-xl text-lg leading-relaxed text-muted",
					children: "Studania builds a full study pack for whatever you type — explanation, flashcards, questions, and a teach-back that actually grades understanding."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-8 flex flex-col gap-3 sm:flex-row",
					onSubmit: (e) => {
						e.preventDefault();
						openConcept(query);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Photosynthesis, quadratic equations, Ohm's law...",
						"aria-label": "Concept to study",
						autoFocus: true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						size: "lg",
						disabled: loading || query.trim().length < 2,
						children: [
							loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : null,
							"Start",
							!loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
						]
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 rounded-lg bg-bad/10 px-4 py-3 text-sm text-bad",
					children: error
				}),
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pt-2 text-sm text-muted",
							children: "Writing a study pack for this concept..."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 flex flex-wrap gap-2",
					children: SUGGESTIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setQuery(item);
							openConcept(item);
						},
						className: "min-h-11 rounded-full border border-border bg-elevated px-3.5 text-sm text-fg shadow-border hover:border-accent/30",
						children: item
					}, item))
				}), hydrated && recents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mb-4 flex items-center gap-2 text-lg font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4 text-muted" }), "Continue"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: recents.map((slug) => packs[slug]).filter(Boolean).map((pack) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setActive(pack),
							className: "rounded-xl bg-elevated p-5 text-left shadow-border transition-transform duration-150 hover:-translate-y-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-medium",
								children: pack.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 line-clamp-2 text-sm leading-relaxed text-muted",
								children: pack.summary
							})]
						}, pack.slug))
					})]
				})] })
			]
		})]
	});
}
//#endregion
export { Home as component };
