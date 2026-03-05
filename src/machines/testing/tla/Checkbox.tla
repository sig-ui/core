---- MODULE Checkbox ----
\* Auto-generated from @sig-ui/core/machines/checkbox.js
\* Model-based testing spec for Apalache MC
\*
\* States:   unchecked, checked, indeterminate
\* Events:   TOGGLE, CHECK, SET_INDETERMINATE, UNCHECK

EXTENDS Integers

VARIABLES
  \* @type: Str;
  state,
  \* @type: Str;
  edge

States == {"unchecked", "checked", "indeterminate"}
Events == {"TOGGLE", "CHECK", "SET_INDETERMINATE", "UNCHECK"}
Edges == {"Unchecked_Toggle", "Unchecked_Check", "Unchecked_SetIndeterminate", "Checked_Toggle", "Checked_Uncheck", "Checked_SetIndeterminate", "Indeterminate_Toggle", "Indeterminate_Check", "Indeterminate_Uncheck"}

Init ==
  /\ state = "unchecked"
  /\ edge = "Init"

\* unchecked --TOGGLE--> checked
Unchecked_Toggle ==
  /\ state = "unchecked"
  /\ state' = "checked"
  /\ edge' = "Unchecked_Toggle"

\* unchecked --CHECK--> checked
Unchecked_Check ==
  /\ state = "unchecked"
  /\ state' = "checked"
  /\ edge' = "Unchecked_Check"

\* unchecked --SET_INDETERMINATE--> indeterminate
Unchecked_SetIndeterminate ==
  /\ state = "unchecked"
  /\ state' = "indeterminate"
  /\ edge' = "Unchecked_SetIndeterminate"

\* checked --TOGGLE--> unchecked
Checked_Toggle ==
  /\ state = "checked"
  /\ state' = "unchecked"
  /\ edge' = "Checked_Toggle"

\* checked --UNCHECK--> unchecked
Checked_Uncheck ==
  /\ state = "checked"
  /\ state' = "unchecked"
  /\ edge' = "Checked_Uncheck"

\* checked --SET_INDETERMINATE--> indeterminate
Checked_SetIndeterminate ==
  /\ state = "checked"
  /\ state' = "indeterminate"
  /\ edge' = "Checked_SetIndeterminate"

\* indeterminate --TOGGLE--> checked
Indeterminate_Toggle ==
  /\ state = "indeterminate"
  /\ state' = "checked"
  /\ edge' = "Indeterminate_Toggle"

\* indeterminate --CHECK--> checked
Indeterminate_Check ==
  /\ state = "indeterminate"
  /\ state' = "checked"
  /\ edge' = "Indeterminate_Check"

\* indeterminate --UNCHECK--> unchecked
Indeterminate_Uncheck ==
  /\ state = "indeterminate"
  /\ state' = "unchecked"
  /\ edge' = "Indeterminate_Uncheck"

\* @type: <<Str, Str>>;
vars == <<state, edge>>

Next ==
  \/ Unchecked_Toggle
  \/ Unchecked_Check
  \/ Unchecked_SetIndeterminate
  \/ Checked_Toggle
  \/ Checked_Uncheck
  \/ Checked_SetIndeterminate
  \/ Indeterminate_Toggle
  \/ Indeterminate_Check
  \/ Indeterminate_Uncheck

\* ================================================================
\* Invariants
\* ================================================================

TypeOK ==
  /\ state \in States
  /\ edge \in Edges \union {"Init"}

\* All non-terminal states have at least one unguarded transition.
\* Deadlock is structurally impossible.
NoDeadlock == TRUE

\* ================================================================
\* Reachability (counterexample proves the state is reachable)
\* ================================================================

NotIn_Unchecked == state /= "unchecked"
NotIn_Checked == state /= "checked"
NotIn_Indeterminate == state /= "indeterminate"

\* ================================================================
\* Edge coverage (counterexample proves the transition is traversable)
\* ================================================================

NoEdge_Unchecked_Toggle == edge /= "Unchecked_Toggle"
NoEdge_Unchecked_Check == edge /= "Unchecked_Check"
NoEdge_Unchecked_SetIndeterminate == edge /= "Unchecked_SetIndeterminate"
NoEdge_Checked_Toggle == edge /= "Checked_Toggle"
NoEdge_Checked_Uncheck == edge /= "Checked_Uncheck"
NoEdge_Checked_SetIndeterminate == edge /= "Checked_SetIndeterminate"
NoEdge_Indeterminate_Toggle == edge /= "Indeterminate_Toggle"
NoEdge_Indeterminate_Check == edge /= "Indeterminate_Check"
NoEdge_Indeterminate_Uncheck == edge /= "Indeterminate_Uncheck"

====
