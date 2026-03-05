---- MODULE Button ----
\* Auto-generated from @sig-ui/core/machines/button.js
\* Model-based testing spec for Apalache MC
\*
\* States:   idle, pressed, loading
\* Events:   PRESS, LOAD_START, RELEASE, LOAD_END
\* Guards:   notLoading

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge,
  \* @type: Bool;
  guard_notLoading

States == {"idle", "pressed", "loading"}
Events == {"PRESS", "LOAD_START", "RELEASE", "LOAD_END"}
Edges == {"Idle_Press", "Idle_LoadStart", "Pressed_Release", "Loading_LoadEnd"}

Init ==
  /\ state = "idle"
  /\ edge = "Init"
  /\ guard_notLoading \in BOOLEAN

\* idle --PRESS--> pressed
Idle_Press ==
  /\ state = "idle"
  /\ state' = "pressed"
  /\ edge' = "Idle_Press"
  /\ guard_notLoading' \in BOOLEAN

\* idle --LOAD_START--> loading
Idle_LoadStart ==
  /\ state = "idle"
  /\ state' = "loading"
  /\ edge' = "Idle_LoadStart"
  /\ guard_notLoading' \in BOOLEAN

\* pressed --RELEASE [guard: notLoading]--> idle
Pressed_Release ==
  /\ state = "pressed"
  /\ guard_notLoading = TRUE
  /\ state' = "idle"
  /\ edge' = "Pressed_Release"
  /\ guard_notLoading' \in BOOLEAN

\* loading --LOAD_END--> idle
Loading_LoadEnd ==
  /\ state = "loading"
  /\ state' = "idle"
  /\ edge' = "Loading_LoadEnd"
  /\ guard_notLoading' \in BOOLEAN

\* @type: <<Str, Str, Bool>>;
vars == <<state, edge, guard_notLoading>>

Next ==
  \/ Idle_Press
  \/ Idle_LoadStart
  \/ Pressed_Release
  \/ Loading_LoadEnd

\* ================================================================
\* Invariants
\* ================================================================

TypeOK ==
  /\ state \in States
  /\ edge \in Edges \union {"Init"}

\* Deadlock is possible in states where all exits are guarded.
\* CanDeadlock_* invariants prove (via counterexample) that these are reachable.

\* Deadlock: pressed with all guards blocking
CanDeadlock_Pressed == ~(state = "pressed" /\ guard_notLoading = FALSE)

\* ================================================================
\* Reachability (counterexample proves the state is reachable)
\* ================================================================

NotIn_Idle == state /= "idle"
NotIn_Pressed == state /= "pressed"
NotIn_Loading == state /= "loading"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Idle_Press == edge /= "Idle_Press"
NoEdge_Idle_LoadStart == edge /= "Idle_LoadStart"
NoEdge_Pressed_Release == edge /= "Pressed_Release"
NoEdge_Loading_LoadEnd == edge /= "Loading_LoadEnd"

====
