export default interface ISimilarityCalculation {
    id: number,
    child_context_id: number,
    parent_context_id: number,
    status: string,
    created: string,
    modified: string,
    creation_type: string,
    threshold: number,
}