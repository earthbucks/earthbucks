export declare const appRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
    ctx: {
        cookie: string | undefined;
        setHeader: (key: string, value: string) => void;
        pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
        user: {
            id: number;
            pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            minPayment: number;
            nSwipes: number;
            nBlocks: number;
            nRewinds: number;
            nImpCoinBadges: number;
            nFruitcakeBadges: number;
            isBanned: boolean;
            isMembershipVerified: boolean;
        } | null;
        completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
            isMembershipVerified: boolean;
        } | null;
        sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
    };
    meta: object;
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: import("@trpc/server").DefaultDataTransformer;
}>, {
    auth: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        getSigninChallenge: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: import("@earthbucks/ebx-lib/dist/signin-challenge.js").SigninChallenge;
            _output_out: string;
        }, unknown>;
        postSigninResponse: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
            };
            _input_in: string;
            _input_out: import("@earthbucks/ebx-lib/dist/signin-response.js").SigninResponse;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, string>;
        signout: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _ctx_out: {
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
            _meta: object;
        }, void>;
    }>;
    blockMessage: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        getLatest: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, {
            id: null;
            num: null;
        } | {
            id: string;
            num: number;
        }>;
        postNew: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: {
                message: string;
                blockMessageHeader: string;
            };
            _input_out: {
                message: string;
                blockMessageHeader: import("@earthbucks/ebx-lib/dist/block-message-header.js").BlockMessageHeader;
            };
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, void>;
    }>;
    buttonConfig: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        setNButtons: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: 1 | 2 | 3 | 4;
            _input_out: 1 | 2 | 3 | 4;
            _output_in: number;
            _output_out: number;
        }, unknown>;
    }>;
    identellica: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        createVerificationRequest: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, {
            url: string;
        }>;
    }>;
    keys: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        createNewDerivedKey: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, {
            id: number;
            clientPubKey: string;
            clientDerivationPrivKey: string;
            derivedPubKey: string;
            derivedPkh: string;
            createdAt: Date;
        }>;
    }>;
    mine: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        getSignedWorkData: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, {
            signedWorkData: string;
            prevHeader: string | null;
            prevPrevHeader: string | null;
        }>;
        submitSignedWorkData: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: {
                header: string;
                signedWorkData: string;
            };
            _input_out: {
                header: string;
                signedWorkData: string;
            };
            _output_in: {
                isValidShare: boolean;
                isValidBlock: boolean;
                error?: string | undefined;
                shareId?: number | undefined;
            };
            _output_out: {
                isValidShare: boolean;
                isValidBlock: boolean;
                error?: string | undefined;
                shareId?: number | undefined;
            };
        }, unknown>;
    }>;
    userAvatar: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        uploadAvatar: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: string;
            _input_out: import("@webbuf/webbuf").WebBuf;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, void>;
    }>;
    userChallenge: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        getCompuchaChallenge: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, string>;
        postCompuchaResponse: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: string;
            _input_out: import("@earthbucks/ebx-lib/dist/compucha-challenge.js").CompuchaChallenge;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, void>;
    }>;
    userName: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        isUserNameAvailable: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: string;
            _input_out: string;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, boolean>;
        setUserName: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: string;
            _input_out: string;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, Response | undefined>;
    }>;
    pay: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                nRewinds: number;
                nImpCoinBadges: number;
                nFruitcakeBadges: number;
                isBanned: boolean;
                isMembershipVerified: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
                isMembershipVerified: boolean;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        getEbxAddressUserId: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: {
                ebxAddress: string;
            };
            _input_out: {
                ebxAddress: string;
            };
            _output_in: {
                userId: number;
            } | null;
            _output_out: {
                userId: number;
            } | null;
        }, unknown>;
        getNewUnsignedTransaction: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: {
                toEbxAddress: string;
                amountInAdams: string;
            } | {
                toEbxAddress: string;
                sendMaxAmount: true;
            };
            _input_out: {
                toEbxAddress: string;
                amountInAdams: string;
            } | {
                toEbxAddress: string;
                sendMaxAmount: true;
            };
            _output_in: {
                error: null;
                value: {
                    toUserDerivedPubKey: string;
                    workingBlockNum: number;
                    unsignedTx: string;
                    txOutBnMap: string;
                    derivedKeys: {
                        id: number;
                        clientPubKey: string;
                        derivedPubKey: string;
                        derivedPkh: string;
                        isUsed: boolean;
                        clientDerivationPrivKey: string;
                    }[];
                };
            } | {
                error: "Too many inputs" | "Not enough funds" | "Amount must be positive";
                value: null;
            };
            _output_out: {
                error: null;
                value: {
                    toUserDerivedPubKey: string;
                    workingBlockNum: number;
                    unsignedTx: string;
                    txOutBnMap: string;
                    derivedKeys: {
                        id: number;
                        clientPubKey: string;
                        derivedPubKey: string;
                        derivedPkh: string;
                        isUsed: boolean;
                        clientDerivationPrivKey: string;
                    }[];
                };
            } | {
                error: "Too many inputs" | "Not enough funds" | "Amount must be positive";
                value: null;
            };
        }, unknown>;
        sendTransaction: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: {
                encryptedMessage: string;
                fromUserDerivedPubKey: string;
                toUserDerivedPubKey: string;
                toEbxAddress: string;
                signedTx: string;
            };
            _input_out: {
                encryptedMessage: string;
                fromUserDerivedPubKey: string;
                toUserDerivedPubKey: string;
                toEbxAddress: string;
                signedTx: string;
            };
            _output_in: undefined;
            _output_out: undefined;
        }, unknown>;
        getClientDerivationPrivKeyForPayment: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        nRewinds: number;
                        nImpCoinBadges: number;
                        nFruitcakeBadges: number;
                        isBanned: boolean;
                        isMembershipVerified: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                        isMembershipVerified: boolean;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/ebx-lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    nRewinds: number;
                    nImpCoinBadges: number;
                    nFruitcakeBadges: number;
                    isBanned: boolean;
                    isMembershipVerified: boolean;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                cookie: string | undefined;
                setHeader: (key: string, value: string) => void;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                    isMembershipVerified: boolean;
                } | null;
            };
            _input_in: {
                paymentId: number;
            };
            _input_out: {
                paymentId: number;
            };
            _output_in: {
                clientPubKey: string;
                derivedPubKey: string;
                derivedPkh: string;
                clientDerivationPrivKey: string;
                dhPubKey: string;
            };
            _output_out: {
                clientPubKey: string;
                derivedPubKey: string;
                derivedPkh: string;
                clientDerivationPrivKey: string;
                dhPubKey: string;
            };
        }, unknown>;
    }>;
}>;
export type AppRouter = typeof appRouter;
