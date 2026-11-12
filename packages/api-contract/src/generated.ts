// This file is auto-generated from openapi.json. Do not edit it manually.

export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Health */
        get: operations["getHealth"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Readiness */
        get: operations["getReadiness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/lyrics/candidates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Lyric Candidates */
        get: operations["getLyricCandidates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** ErrorDetail */
        ErrorDetail: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Requestid */
            requestId: string;
        };
        /** ErrorEnvelope */
        ErrorEnvelope: {
            error: components["schemas"]["ErrorDetail"];
        };
        /** HealthResponse */
        HealthResponse: {
            /**
             * Status
             * @default ok
             * @constant
             */
            status: "ok";
        };
        /** LyricCandidate */
        LyricCandidate: {
            /** Album */
            album: string | null;
            /** Artist */
            artist: string;
            /**
             * Attribution
             * @default Lyrics supplied by LRCLIB
             */
            attribution: string;
            /**
             * Confidenceband
             * @enum {string}
             */
            confidenceBand: "strong" | "ambiguous" | "weak";
            /** Durationdifferenceseconds */
            durationDifferenceSeconds: number | null;
            /** Durationseconds */
            durationSeconds: number;
            /** Instrumental */
            instrumental: boolean;
            /**
             * Lyricdocumentversion
             * @default 1
             */
            lyricDocumentVersion: number;
            /** Matchingpolicyversion */
            matchingPolicyVersion: string;
            /** Normalizedsegments */
            normalizedSegments: {
                [key: string]: unknown;
            }[];
            /** Plainlyrics */
            plainLyrics: string | null;
            /** Providerrecordid */
            providerRecordId: string;
            /** Rightscapabilities */
            rightsCapabilities: {
                [key: string]: boolean | string;
            };
            /** Score */
            score: number;
            /**
             * Sourceprovider
             * @default lrclib
             * @constant
             */
            sourceProvider: "lrclib";
            /** Syncedlyrics */
            syncedLyrics: string | null;
            /** Timingtype */
            timingType: "line" | null;
            /** Title */
            title: string;
            /** Warnings */
            warnings: string[];
        };
        /** LyricCandidateResponse */
        LyricCandidateResponse: {
            /** Candidates */
            candidates: components["schemas"]["LyricCandidate"][];
            /** Retryafterseconds */
            retryAfterSeconds?: number | null;
            /**
             * Status
             * @enum {string}
             */
            status: "ready" | "missing" | "rate_limited" | "timeout" | "overloaded" | "unavailable";
        };
        /** ReadinessResponse */
        ReadinessResponse: {
            /** Checks */
            checks: {
                [key: string]: "ok";
            };
            /**
             * Status
             * @default ready
             * @constant
             */
            status: "ready";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getHealth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
            /** @description Error response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getReadiness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadinessResponse"];
                };
            };
            /** @description Error response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Error response */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
    getLyricCandidates: {
        parameters: {
            query: {
                album?: string | null;
                artist: string;
                duration_seconds?: number | null;
                title: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LyricCandidateResponse"];
                };
            };
            /** @description Error response */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
            /** @description Error response */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorEnvelope"];
                };
            };
        };
    };
}
