
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const rules = [
    {
        section: "1. Auction Overview",
        content: [
            "Platform: Google Meet",
            "Each house acts as one franchise.",
            "Auction is conducted in live sessions under moderator supervision.",
        ],
    },
    {
        section: "2. Auction Purse & Squad Limits",
        subsections: [
            {
                title: "2.1 Purse",
                content: [
                    "Each house receives a fixed virtual purse of ₹80 crore.",
                    "Purse cannot be increased or replenished.",
                ],
            },
            {
                title: "2.2 Squad Size",
                content: [
                    "Minimum: 11 players",
                    "Maximum: 15 players",
                    "Failure to meet minimum squad size results in disqualification.",
                ],
            },
        ],
    },
    {
        section: "3. Player Pool & Randomisation System",
        content: [
            "Players are grouped into predefined sets.",
            "Player order will be randomised live using a dedicated auction randomisation website.",
            "No manual interference is permitted.",
            "The draw order is final and non-negotiable.",
        ],
    },
    {
        section: "4. Auction Roles & Authority",
        content: [
            "Each house must nominate:",
            "House Representative (Bidder) – only person allowed to bid",
            "Strategic Members – internal discussion only",
            "House Representative Substitution:",
            "Each house must nominate one backup bidder before the auction begins.",
            "Backup bidder may take over only with OC approval.",
            "Mid-bid substitutions are not permitted.",
            "If no valid bidder is available, the house forfeits bidding until resolved.",
            "Any bid by an unauthorised member is invalid.",
        ],
    },
    {
        section: "5. Bidding Mechanics",
        subsections: [
            {
                title: "5.1 Base Price & Fixed Bid Increment Structure",
                content: [
                    "Each player shall enter the auction at a predefined base price.",
                    "To ensure uniformity, fairness, and controlled bidding progression, all bids must strictly follow the fixed incremental slabs defined below.",
                    "No custom, fractional, or off-slab bids shall be permitted.",
                ],
                table: {
                    headers: ["Current Bid Value", "Mandatory Increment"],
                    rows: [
                        ["Up to ₹1.00 crore", "₹5 lakh"],
                        ["₹1.00 crore – ₹2.00 crore", "₹10 lakh"],
                        ["₹2.00 crore – ₹5.00 crore", "₹20 lakh"],
                        ["Above ₹5.00 crore", "₹50 lakh"],
                    ],
                },
            },
            {
                title: "5.1.1 Increment Transition Rule",
                content: [
                    "Once a bid crosses into a higher slab, the new increment immediately applies.",
                    "The auctioneer will announce the applicable increment whenever a slab transition occurs.",
                ],
            },
            {
                title: "5.1.2 Validity of Bids",
                content: [
                    "Any bid not conforming to the prescribed increment structure will be deemed invalid.",
                    "The auctioneer may:",
                    "Reject the bid outright, or",
                    "Ask the bidder to restate a valid bid immediately.",
                    "Repeated violation of increment rules may attract penalties under Auction Floor Misconduct."
                ],
            },
            {
                title: "5.1.3 Authority Clause",
                content: [
                    "The auctioneer’s declaration of the current bid slab and increment shall be considered final during live bidding.",
                    "No post-bid objections regarding increments will be entertained."
                ]
            },
            {
                title: "5.2 – Live Bidding Participation Protocol (Google Meet)",
                content: [
                    "To ensure orderly conduct, clarity, and fairness during live bidding, the following participation protocol shall be strictly enforced:",
                ]
            },
            {
                title: "5.2.1 Active Bidder Limit",
                content: [
                    "At any given moment, only two (2) houses may actively participate in bidding for a player.",
                    "Active participation is indicated exclusively via the Google Meet “Raise Hand” feature.",
                    "Verbal bidding or visual gestures other than those specified shall not be recognised."
                ]
            },
            {
                title: "5.2.2 Entry into Active Bidding",
                content: [
                    "Houses wishing to enter a bid must raise their hand while the bidding window is open.",
                    "The first two valid hand raises, as acknowledged by the auctioneer, shall become the active bidders.",
                    "Any subsequent hand raises will be placed in a waiting queue and will not be acknowledged until a slot becomes available."
                ]
            },
            {
                title: "5.2.3 Exit from Active Bidding",
                content: [
                    "A house may voluntarily exit an ongoing bid by:",
                    "Clearly displaying a thumbs-down gesture (👎) on Google Meet, and",
                    "Lowering their raised hand on Google Meet.",
                    "Once a house exits:",
                    "It cannot re-enter the same bid cycle until another house has placed a valid bid or the bid value changes, and",
                    "The auctioneer may invite the next waiting house to enter active bidding."
                ]
            },
            {
                title: "5.2.4 Rotation & Re-entry",
                content: [
                    "When one active bidder exits, other houses may enter the bidding by raising their hand.",
                    "The auctioneer will acknowledge new entrants strictly on a first-come, first-recognised basis.",
                    "This rotation continues until:",
                    "Only one active bidder remains, or",
                    "The hammer falls."
                ]
            },
            {
                title: "5.2.5 Final Bid Condition",
                content: [
                    "If only one active house remains and no new valid entry occurs within the auctioneer’s final call:",
                    "The player shall be sold to the remaining active house at the last valid bid."
                ]
            },
            {
                title: "5.2.6 Enforcement & Misconduct",
                content: [
                    "Any attempt to:",
                    "Bypass the hand-raise system",
                    "Verbally interrupt active bidding",
                    "Re-enter immediately after backing out will be treated as Auction Floor Misconduct and penalised accordingly.",
                    "The auctioneer’s recognition of:",
                    "Active bidders",
                    "Entry order",
                    "Exit confirmation shall be final and binding."
                ]
            }
        ]
    },
    {
        section: "6. Auctioneer Protocol",
        content: [
            "Base price announced",
            "Bidding opens",
            "Auctioneer calls:",
            "“Going once”",
            "“Going twice”",
            "“Sold”",
            "Hammer fall confirms sale",
            "No bids are accepted after “Sold”.",
        ],
    },
    {
        section: "7. Bid Retraction & Accidental Bids",
        content: [
            "All bids are final once acknowledged by the auctioneer.",
            "Accidental bids, miscommunication, or connectivity-related delays will not be grounds for bid reversal.",
            "If two bids are raised simultaneously, the auctioneer’s verbal confirmation decides priority.",
            "No bid retractions are allowed after the auctioneer announces the next increment.",
        ],
    },
    {
        section: "8. Playing XI Composition (Mandatory)",
        content: [
            "Each house must submit one Playing XI:",
            "4 Specialist Batters",
            "1 Specialist Wicketkeeper",
            "2 Recognised All-Rounders",
            "3 Specialist Bowlers",
            "1 Floating Player (any role)",
            "3 Players of the playing 11 must be from the uncapped category.",
            "Failure to meet this requirement will result in Playing XI rejection until corrected or a points penalty as decided by the OC.",
        ],
    },
    {
        section: "9. Player Points & Captaincy System",
        content: [
            "Each player is assigned a performance value between 0–100 points, based on a predefined formula.",
            "Multipliers:",
            "Captain: 3×",
            "Vice-Captain: 2×",
            "Others: 1×",
            "Total team score = sum of all player points after multipliers.",
            "Playing XI & Captaincy Lock",
            "Playing XI, Captain, and Vice-Captain must be submitted within the deadline announced by the OC.",
            "Once submitted, no changes are permitted.",
            "Late submission may result in:",
            "Point penalties",
            "Auto-assignment by OC",
        ],
    },
    {
        section: "10. Player Points Allocation System (Transparency & Methodology)",
        subsections: [
            {
                title: "10.1 Predefined & Fixed Nature of Points",
                content: [
                    "Every player in the auction pool is assigned a fixed points value prior to the auction.",
                    "These points are locked before the event begins and do not change during or after the auction under any circumstances.",
                    "The maximum possible points for any player is 100.",
                    "This ensures that:",
                    "No post-auction manipulation is possible",
                    "All houses operate with equal and known information",
                    "Team rankings are purely merit-based",
                ]
            },
            {
                title: "10.2 Basis of Player Points Calculation",
                content: [
                    "Player points have been derived using a structured, multi-factor system, which includes:",
                    "Role-Based Weightage:",
                    "Batters",
                    "Bowlers",
                    "All-Rounders",
                    "Wicketkeepers",
                    "All-rounders and wicketkeepers receive higher base weightage due to multi-skill contributions.",
                    "Experience Category:",
                    "Capped players (international experience)",
                    "Uncapped players",
                    "Reserve Price as Market Indicator:",
                    "The official reserve price is used as a proxy for market value",
                    "Higher reserve prices attract proportionally higher points",
                    "This methodology ensures balanced valuation between:",
                    "Skill",
                    "Experience",
                    "Market demand",
                ]
            },
            {
                title: "10.3 Data Source & Authenticity",
                content: [
                    "Official player data from the IPL 2025 Mega Auction has been used as the primary reference for:",
                    "Player roles",
                    "Experience status",
                    "Reserve prices",
                    "This step has been taken to:",
                    "Align the simulation closely with real-world IPL dynamics",
                    "Maintain objective and publicly verifiable benchmarks",
                    "Eliminate subjective or arbitrary valuation",
                ]
            },
            {
                title: "10.4 Exception: Marquee Set Players",
                content: [
                    "The Player Points Allocation System applies to all players EXCEPT those included in the Marquee Set.",
                    "Marquee Set players are treated as a special category due to:",
                    "Exceptional reputation",
                    "Elite status",
                    "Disproportionate strategic impact in real IPL auctions",
                    "For Marquee Set players:",
                    "Standard points-calculation rules do not apply",
                    "Their valuation is intentionally kept outside the formula to preserve:",
                    "Auction excitement",
                    "Strategic risk-reward dynamics",
                    "Authentic IPL-style unpredictability",
                    "This exception is uniformly applied across all houses and does not provide any unfair advantage.",
                ]
            },
            {
                title: "10.5 Transparency Declaration",
                content: [
                    "The Organising Committee formally declares that:",
                    "The same points methodology has been consistently applied to all non-marquee players",
                    "No player’s points have been altered, adjusted, or overridden post-calculation",
                    "All teams are evaluated using the exact same scoring framework",
                    "This system has been implemented to uphold:",
                    "Competitive integrity",
                    "Strategic fairness",
                    "Complete transparency in winner determination",
                ]
            }
        ]
    }
];

export default function RulebookPage() {
    const [activeRuleIndex, setActiveRuleIndex] = useState(0);
    const activeRule = rules[activeRuleIndex];

    const contentVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

    return (
        <motion.div
            className="w-full max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="glow-border bg-card/70 backdrop-blur-sm overflow-hidden h-[80vh] flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center text-3xl">
                        <BookOpen className="mr-3 h-8 w-8 text-primary" />
                        IPL Auction Showdown
                    </CardTitle>
                    <CardDescription>
                        The official rules and regulations for the auction process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-[250px_1fr] gap-8 flex-1 min-h-0">
                    {/* Navigation Sidebar */}
                    <aside>
                        <ScrollArea className="h-full pr-4">
                            <nav className="flex flex-col gap-1">
                                {rules.map((rule, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveRuleIndex(index)}
                                        className={cn(
                                            "flex items-center justify-between text-left p-2 rounded-md text-sm font-medium transition-colors w-full",
                                            activeRuleIndex === index 
                                                ? "bg-primary text-primary-foreground" 
                                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <span className="truncate">{rule.section}</span>
                                        {activeRuleIndex === index && <ChevronRight className="h-4 w-4 shrink-0" />}
                                    </button>
                                ))}
                            </nav>
                        </ScrollArea>
                    </aside>

                    {/* Content Display */}
                    <main className="relative min-h-0">
                        <ScrollArea className="h-full pr-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeRuleIndex}
                                    variants={contentVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-3xl font-headline text-primary">{activeRule.section}</h2>
                                    
                                    <div className="space-y-4 text-muted-foreground prose prose-invert prose-p:my-2 prose-li:my-1">
                                        {activeRule.content && activeRule.content.map((text, i) => (
                                            <p key={i} className="ml-4 list-item list-disc list-inside">{text.includes(':') ? <><span className="font-bold text-foreground/80">{text.split(':')[0]}:</span>{text.substring(text.indexOf(':') + 1)}</> : text}</p>
                                        ))}
                                        
                                        {activeRule.subsections && activeRule.subsections.map((sub, subIndex) => (
                                            <div key={subIndex} className="ml-4 space-y-3 pt-3">
                                                <h4 className="font-bold text-xl text-foreground/90">{sub.title}</h4>
                                                <div className="ml-4 space-y-2 border-l-2 border-primary/20 pl-4">
                                                    {sub.content && sub.content.map((text, i) => (
                                                        <p key={i} className="list-item list-disc list-inside">{text.includes(':') ? <><span className="font-semibold text-foreground/80">{text.split(':')[0]}:</span>{text.substring(text.indexOf(':') + 1)}</> : text}</p>
                                                    ))}
                                                </div>
                                                {sub.table && (
                                                        <div className="my-4 border border-border rounded-lg overflow-hidden glow-border">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow className="bg-primary/10">
                                                                    {sub.table.headers.map(header => <TableHead key={header} className="text-primary">{header}</TableHead>)}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {sub.table.rows.map((row, rIndex) => (
                                                                    <TableRow key={rIndex} className="bg-card/50">
                                                                        {row.map((cell, cIndex) => <TableCell key={cIndex}>{cell}</TableCell>)}
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {activeRule.table && (
                                            <div className="my-4 border border-border rounded-lg overflow-hidden glow-border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-primary/10">
                                                            {activeRule.table.headers.map(header => <TableHead key={header} className="text-primary">{header}</TableHead>)}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {activeRule.table.rows.map((row, rIndex) => (
                                                            <TableRow key={rIndex} className="bg-card/50">
                                                                {row.map((cell, cIndex) => <TableCell key={cIndex} className={cIndex === 0 ? 'font-bold' : ''}>{cell}</TableCell>)}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </ScrollArea>
                    </main>
                </CardContent>
            </Card>
        </motion.div>
    );
}
