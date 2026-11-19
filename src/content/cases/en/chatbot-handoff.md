---
slug: chatbot-handoff
short: Chatbot service desk
title: When chatbots aren’t enough
kicker: Product Design · Conversation Design · UX Research · MoSCoW · Usability Testing
subtitle: Redesigning the service desk that hands conversations from the chatbot to a human agent
seoTitle: "Chatbot service desk: bot-to-human handoff redesign"
description: UX and product case study at Rhizom: research, personas, MoSCoW, user stories and two rounds of Maze testing for the chatbot-to-agent handoff.
card: The service desk that solves the handoff from chatbot to human agent, prioritized with MoSCoW and validated with users.
cover: c_cover
coverAlt: Robot icon shaped like a speech bubble, with a smiling pixel face, on a purple background with a pattern of characters
skills: [Conversation Design, UX Research, MoSCoW, User Stories, Backlog, Usability Testing, Maze, Ant Design]
company: Rhizom · B2B chatbot platform
role: UX/UI Designer
period: Between 2018 and 2022, at Rhizom
team: 1 UX/UI Designer, 1 PO and 3 developers
stat1: 4 | research sources crossed
stat2: 5 | needs found
stat3: 2 | rounds of Maze testing
stat4: 100% | of testers rated the other missions easy in round 2
---

## About the project

The service desk on Rhizom’s chatbot platform is where a human agent takes over a conversation when the bot can’t handle it. The native version only allowed taking over a conversation and handing it back to the bot, so customers paid extra to integrate another service desk. The project redesigned that handover from chatbot to agent.

## Challenges

- Find out why customers paid for another service desk instead of using the native one.
- Go beyond “take over and hand back”: history, priority, notifications, transfers and closing conversations.
- Fit the MVP, with scope prioritized together with the PO and developers.
- Validate the main flow with users before development.

<!-- fim-topo -->

## Business context

Virtual assistants can’t always handle unexpected scenarios, and many users still find them cold or confusing. When a human is needed mid-conversation, the chatbot flow hands over to an agent.

The native service desk on Rhizom’s platform was an MVP: it only allowed taking over a conversation and handing it back to the bot. Customers who needed more preferred to pay to integrate another solution. Finding out why became the starting point.

![Chatbot flow with the human takeover step](img:c12)

## Kick-off

The project’s starting point:

- **Goal:** understand why customers preferred paying for another service desk and deliver an MVP that solved what comes after taking over a conversation.
- **User types:** service desk agents and administrators.
- **UX/UI scope:** the research plan, the personas, the three-column screen architecture, the admin dashboard metrics, the Maze test script and the backlog user stories.
- **Responsibilities:** UX/UI by the project’s designer; MoSCoW prioritization, together with the PO and developers, by feasibility and deadline; development by the 3 developers.
- **How to measure:** usability tests on Maze, with missions based on Jobs to Be Done.

## Team and timeline

- **Team:** 1 UX/UI Designer, 1 PO and 3 developers.
- **Timeline:** between 2018 and 2022, at Rhizom.
- **Tools:** Figma, Maze and Ant Design.

## Hypothesis

Starting question: why did customers prefer paying for another service desk instead of using the native one?

Working hypothesis: customers integrated other solutions because the native service desk stopped at "take over and hand back". The research tested that reading with four sources and confirmed it, since all five needs it found come after the agent takes over the conversation.

## Research

The research combined four sources:

- **Own use and observation:** the service desk was used on one of the designer’s own chatbots, and the company’s agents were observed, with consent.
- **A survey** with customers who had already tried the solution.
- **Interviews** with current and former users.
- **Desk research** on the solutions they mentioned.

The result was five clear needs: customer history, prioritization, notifications, closing or transferring the conversation and an admin dashboard.

Two personas guided the decisions: **Mayara**, 23, an IT student and agent who had used several service desks, and **Felipe**, 32, a service desk administrator and head of customer service. The pains they shared:

- **Complicated interface:** a long learning curve; new agents took a while to be productive.
- **Limited actions:** no way to transfer to another agent or close the conversation.
- **No priority:** no tag, priority or conversation type.
- **No history:** agents started every conversation without context.
- **No metrics:** administrators knew little about team performance.

![CSD matrix with the project’s certainties, suppositions and doubts](img:c11)

## Decisions and trade-offs

- **MoSCoW to fit the MVP.** Research produced more opportunities than the first release could hold. Prioritization was by feasibility and deadline, separating wants from needs.
- **Persona-centered user stories,** such as “As an agent, I want to see my queue of assigned conversations so I can prioritize my work”.
- **Ant Design, the platform’s own library:** the new interface reuses the components the product already used.

In the MoSCoW matrix, every feature got a place: what had to be in the MVP, what should be, what could be and what would stay out.

![MoSCoW prioritization of features](img:c8)

After prioritization, each feature became a user story in the backlog, written from the personas.

![User stories in the backlog](img:c7)

## Solution

Three columns, with every action at hand:

- **Left:** chat list with search, filters and the group queue.
- **Center:** the conversation, with the source channel and commands to take over, prioritize, transfer and close.
- **Right:** a collapsible panel with customer data and history, where the agent sets priority and type and adds tags and comments.

![High-fidelity service desk with the chat list on the left, the conversation in the center and customer details on the right](img:c3)

For administrators, a dashboard brings together the metrics that came up in interviews: active chats, queued chats, unassigned chats, available agents, average chat time, average wait time, abandonment rate and breakdown by status, type and priority.

![Admin dashboard with customer service metrics](img:c2)

## Validation

From whiteboard to Figma, the prototype was tested on Maze with missions based on Jobs to Be Done, remote and unmoderated.

- **First round:** the mission to find a new chat without priority had many misclicks. It was a typical administrator task, not an agent task. The prototype and the mission were adjusted.
- **Second round:** the critical task was rated easy and the experience intuitive. The other missions were rated easy by 100% of testers, with no drop-offs.

![Usability test results on Maze](img:c4)

## How it was measured

- **Goal and hypothesis:** understand why clients paid for another service desk and deliver an MVP that solved what comes after taking over the conversation. The hypothesis: the native service desk stopped at “take over and hand back”.
- **North star metric:** ease of the critical task in the usability test, rated by the testers, because the MVP only made sense if the main flow worked.
- **Supporting metrics:** misclicks, drop-offs and ease of the other missions.
- **Collection:** Maze, remote and unmoderated, with missions based on Jobs to Be Done, in two rounds. The baseline is the first round.
- **Collection, sample:** [PREENCHER: how many people tested in each round?]
- **Result (before → after):** in the first round, the critical mission had many misclicks. In the second, the critical task was rated easy and the other missions were rated easy by 100% of testers, with no drop-offs.
- **What changed in the decision:** the first round showed the critical mission was typical of an administrator, not an agent. The prototype and the mission were adjusted, and after the second round the MVP moved to development.
- **Data limitations:** the test used a prototype, not real usage, and the project material has no post-launch data.

## Post-launch results

- The MVP was defined and moved on to development.

## Learnings

- The first round showed that the critical mission reflected the administrator’s job, not the agent’s. Test missions need to start from the right persona.
- Next time: separate the agent and administrator scripts from the first round, so tasks from the two personas aren’t mixed in the same test.
