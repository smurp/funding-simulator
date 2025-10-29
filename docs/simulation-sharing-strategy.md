# Simulation Sharing and Saving Strategy

## Goals

- Let users continue running simulations entirely in their browser (no server-side persistence required).
- Provide a consistent way to save, retrieve, and organize simulations locally.
- Enable users to share simulations with others in a controlled manner without compromising privacy or local-only operation.
- Support duplicating simulations via a `Save As…` experience.

## User Experience Overview

### Saving Simulations

- Every simulation view gains a primary **Save** button.
- If the simulation originated from a saved entry and has no unsaved edits, the **Save** button stays disabled.
- When a new simulation is saved, the user supplies a unique name (validated client-side to avoid duplicates).
- Saved simulations appear in a global **Saved Simulations** menu that is accessible from the app header and any simulator screen.

### Save As…

- When the current simulation has a saved origin, show a **Save As…** button.
- `Save As…` opens the same name dialog but pre-fills the current name with "Copy of …".
- `Save As…` always creates a new record (enforced by requiring a unique name).
- After `Save As…`, the UI navigates to the new saved entry and marks the session as clean.

### Sharing Simulations

- Saved simulations can be exported as a signed JSON file (`*.fundsim.json`).
- Exported JSON contains:
  - App version metadata for compatibility checks.
  - A timestamp and unique ID for the saved simulation.
  - Simulation input data only (no personal analytics data).
- Import workflow allows users to load a shared JSON file, confirm its contents, and add it to their Saved menu under a new or existing name.
- When opening a shared simulation, the app records the original author metadata but keeps edits local unless re-exported.

## Data Model

Store saved simulations in IndexedDB (via existing Svelte stores) with the following shape:

```ts
interface SavedSimulation {
  id: string;         // UUID
  name: string;       // Unique per user
  createdAt: string;  // ISO timestamp
  updatedAt: string;  // ISO timestamp
  origin?: {
    type: "local" | "imported";
    sourceId?: string;    // id of the original saved simulation (if cloned)
    sourceAuthor?: string;// optional metadata from imports
  };
  appVersion: string;
  payload: SimulationConfig; // existing configuration structure
}
```

- Persist the array of `SavedSimulation` objects in IndexedDB using the `id` as the primary key and `name` as a secondary index for uniqueness.
- Mirror the data into a Svelte store (`savedSimulationsStore`) for reactive UI updates.

## UI Additions

1. **Header Menu**
   - Add a "Saved" dropdown in the main navigation listing recent saved simulations and an "All saved simulations" link.
2. **Saved Simulations Page**
   - Grid/list view with search and sort controls.
   - Each row supports actions: Open, Rename, Duplicate, Export, Delete.
3. **Simulation Screen Toolbar**
   - Add `Save`, `Save As…`, and `Export` actions near existing controls.
   - Show a dirty-state indicator (e.g., an asterisk) when unsaved changes exist.

## Sharing Workflow Details

### Export

1. User clicks `Export` on any saved simulation.
2. App serializes the `SavedSimulation` record to JSON.
3. Optionally signs the payload with an HMAC using a static app secret to detect tampering (stored locally, regenerated per install).
4. Triggers browser download of `simulation-name.fundsim.json`.

### Import

1. User selects `Import Simulation` from the Saved page.
2. App reads the JSON file, validates schema & version.
3. If the name conflicts, prompt the user to rename or overwrite.
4. On confirmation, create a new `SavedSimulation` entry with `origin.type = "imported"` and store the original ID/author if present.

## Conflict Handling

- **Duplicate names**: Prevent creation until the user resolves the conflict. Offer quick rename suggestions ("Name (1)").
- **Version mismatch**: Warn users when importing from a newer app version; allow opt-in conversion if possible.
- **Unsaved changes**: Prompt before navigation if a simulation has unsaved edits and the user attempts to open another saved entry.

## Technical Tasks

1. Create an IndexedDB persistence layer (or enhance existing storage utilities) that supports CRUD operations for `SavedSimulation` entries.
2. Build Svelte stores and derived selectors for:
   - Current simulation state.
   - Dirty state detection (compare current state vs. stored payload hash).
   - Saved simulations collection.
3. Update UI components to surface Save/Save As/Export buttons and saved menu.
4. Implement modal dialogs for naming, importing, and conflict resolution.
5. Create JSON schema validation for import/export to guard against malformed files.
6. Add integration tests covering save/save-as/export/import workflows.
7. Document the user workflow in the README and in-product help.

## Future Enhancements

- Integrate optional cloud sync using user accounts while keeping local-first semantics.
- Allow generating shareable URLs that embed simulation data for quick sharing without files.
- Track simulation history (versioning) to support reverting changes.

