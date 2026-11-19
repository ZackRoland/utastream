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
    "/v1/learning-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Save Learning Item */
        post: operations["saveLearningItem"];
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
    "/v1/track-imports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Complete Track Import */
        post: operations["completeTrackImport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/{user_id}/learning-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get User Learning Items */
        get: operations["getUserLearningItems"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/{user_id}/library": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get User Library */
        get: operations["getUserLibrary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/youtube/metadata": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Youtube Metadata */
        get: operations["getYouTubeMetadata"];
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
        /** CompleteTrackImportRequest */
        CompleteTrackImportRequest: {
            /** Album */
            album?: string | null;
            /** Artist */
            artist: string;
            lyrics: components["schemas"]["ConfirmedLyricInput"];
            source: components["schemas"]["ImportSourceInput"];
            /** Title */
            title: string;
            /**
             * Userid
             * Format: uuid
             */
            userId: string;
        };
        /** CompleteTrackImportResponse */
        CompleteTrackImportResponse: {
            item: components["schemas"]["LibraryTrack"];
            /** Libraryitemcreated */
            libraryItemCreated: boolean;
            /** Sourcecreated */
            sourceCreated: boolean;
            /** Trackcreated */
            trackCreated: boolean;
        };
        /** ConfirmedLyricInput */
        ConfirmedLyricInput: {
            /** Attribution */
            attribution: string;
            /**
             * Confirmedat
             * Format: date-time
             */
            confirmedAt: string;
            /** Durationdifferenceseconds */
            durationDifferenceSeconds: number | null;
            /** Lyricdocumentversion */
            lyricDocumentVersion: number;
            /** Matchingpolicyversion */
            matchingPolicyVersion: string;
            /** Normalizedsegments */
            normalizedSegments: {
                [key: string]: unknown;
            }[];
            /** Providerrecordid */
            providerRecordId: string;
            /** Rightscapabilities */
            rightsCapabilities: {
                [key: string]: unknown;
            };
            /** Score */
            score: number;
            /** Timingoffsetms */
            timingOffsetMs: number;
        };
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
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** ImportSourceInput */
        ImportSourceInput: {
            /**
             * Availability
             * @enum {string}
             */
            availability: "available" | "local_file_required";
            /** Capabilities */
            capabilities: {
                [key: string]: unknown;
            };
            /** Durationseconds */
            durationSeconds: number;
            /** Externalid */
            externalId: string | null;
            /**
             * Kind
             * @enum {string}
             */
            kind: "local_file" | "youtube";
            /** Normalizedurl */
            normalizedUrl: string | null;
            /** Originalmetadata */
            originalMetadata: {
                [key: string]: unknown;
            };
            /** Provenance */
            provenance: {
                [key: string]: unknown;
            };
        };
        /** LearningCollectionResponse */
        LearningCollectionResponse: {
            /** Items */
            items: components["schemas"]["LearningItemResponse"][];
        };
        /** LearningItemResponse */
        LearningItemResponse: {
            /**
             * Createdat
             * Format: date-time
             */
            createdAt: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Lyricdocumentid
             * Format: uuid
             */
            lyricDocumentId: string;
            /** Segmentkey */
            segmentKey: string;
            /** Selectedtext */
            selectedText: string;
            /**
             * Selectionkind
             * @enum {string}
             */
            selectionKind: "expression" | "kanji";
            /**
             * Trackid
             * Format: uuid
             */
            trackId: string;
            /**
             * Userid
             * Format: uuid
             */
            userId: string;
        };
        /** LibraryLyricDocument */
        LibraryLyricDocument: {
            /** Attribution */
            attribution: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Language */
            language: string;
            /** Rightscapabilities */
            rightsCapabilities: {
                [key: string]: unknown;
            };
            /** Segments */
            segments: {
                [key: string]: unknown;
            }[];
            /** Sourceprovider */
            sourceProvider: string;
            /** Sourcerecordid */
            sourceRecordId: string | null;
            /**
             * Timingtype
             * @enum {string}
             */
            timingType: "line" | "word";
            /** Version */
            version: number;
        };
        /** LibraryPlaybackSource */
        LibraryPlaybackSource: {
            /**
             * Availability
             * @enum {string}
             */
            availability: "available" | "unavailable" | "local_file_required";
            /** Capabilities */
            capabilities: {
                [key: string]: unknown;
            };
            /** Durationseconds */
            durationSeconds: number | null;
            /** Externalid */
            externalId: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "local_file" | "youtube" | "fixture";
            /** Normalizedurl */
            normalizedUrl: string | null;
        };
        /** LibraryResponse */
        LibraryResponse: {
            /** Items */
            items: components["schemas"]["LibraryTrack"][];
        };
        /** LibraryTrack */
        LibraryTrack: {
            /** Album */
            album: string | null;
            /** Artist */
            artist: string;
            /** Durationseconds */
            durationSeconds: number;
            /**
             * Libraryitemid
             * Format: uuid
             */
            libraryItemId: string;
            lyrics: components["schemas"]["LibraryLyricDocument"] | null;
            /** Preferredsourceid */
            preferredSourceId: string | null;
            /** Sources */
            sources: components["schemas"]["LibraryPlaybackSource"][];
            /** Title */
            title: string;
            /**
             * Trackid
             * Format: uuid
             */
            trackId: string;
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
        /** SaveLearningItemRequest */
        SaveLearningItemRequest: {
            /**
             * Lyricdocumentid
             * Format: uuid
             */
            lyricDocumentId: string;
            /** Segmentkey */
            segmentKey: string;
            /** Selectedtext */
            selectedText: string;
            /**
             * Selectionkind
             * @enum {string}
             */
            selectionKind: "expression" | "kanji";
            /**
             * Trackid
             * Format: uuid
             */
            trackId: string;
            /**
             * Userid
             * Format: uuid
             */
            userId: string;
        };
        /** ValidationError */
        ValidationError: {
            /** Context */
            ctx?: Record<string, never>;
            /** Input */
            input?: unknown;
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
        };
        /** YouTubeMetadataResponse */
        YouTubeMetadataResponse: {
            /** Artist */
            artist?: string | null;
            /** Providerauthor */
            providerAuthor?: string | null;
            /** Providertitle */
            providerTitle?: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "ready" | "unavailable";
            /** Title */
            title?: string | null;
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
    saveLearningItem: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SaveLearningItemRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LearningItemResponse"];
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
    completeTrackImport: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CompleteTrackImportRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CompleteTrackImportResponse"];
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
    getUserLearningItems: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
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
                    "application/json": components["schemas"]["LearningCollectionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
    getUserLibrary: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
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
                    "application/json": components["schemas"]["LibraryResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
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
    getYouTubeMetadata: {
        parameters: {
            query: {
                video_id: string;
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
                    "application/json": components["schemas"]["YouTubeMetadataResponse"];
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
