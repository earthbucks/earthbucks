export declare const appRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
    ctx: {
        cookie: string | undefined;
        setHeader: (key: string, value: string) => void;
        pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
        user: {
            id: number;
            pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
            createdAt: Date;
            name: string | null;
            avatarId: string | null;
            minPayment: number;
            nSwipes: number;
            nBlocks: number;
            isBanned: boolean;
        } | null;
        completeUserProfile: {
            id: number;
            name: string;
            avatarId: string;
            nSwipes: number;
            pubKeyStr: string;
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
            pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                isBanned: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
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
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
                } | null;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: import("@earthbucks/lib/dist/signin-challenge.js").SigninChallenge;
            _output_out: string;
        }, unknown>;
        postSigninResponse: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
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
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
                } | null;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
                } | null;
                sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
            };
            _input_in: string;
            _input_out: import("@earthbucks/lib/dist/signin-response.js").SigninResponse;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, string>;
        signout: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
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
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
                } | null;
                completeUserProfile: {
                    id: number;
                    name: string;
                    avatarId: string;
                    nSwipes: number;
                    pubKeyStr: string;
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
            pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                isBanned: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                } | null;
            };
            _input_in: {
                message: string;
                blockMessageHeader: string;
            };
            _input_out: {
                message: string;
                blockMessageHeader: import("@earthbucks/lib/dist/block-message-header.js").BlockMessageHeader;
            };
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, void>;
    }>;
    keys: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                isBanned: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
    miningButton: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                isBanned: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
            } | null;
            sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
        };
        meta: object;
        errorShape: import("@trpc/server").DefaultErrorShape;
        transformer: import("@trpc/server").DefaultDataTransformer;
    }>, {
        getNewWorkPack: import("@trpc/server").BuildProcedure<"query", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                } | null;
            };
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, {
            shareId: number;
            retryTarget: string;
            shareTarget: string;
            workPack: string;
        }>;
        postWorkPack: import("@trpc/server").BuildProcedure<"mutation", {
            _config: import("@trpc/server").RootConfig<{
                ctx: {
                    cookie: string | undefined;
                    setHeader: (key: string, value: string) => void;
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                } | null;
            };
            _input_in: {
                count: number;
                duration: number;
                workPack: string;
                shareId: number;
            };
            _input_out: {
                count: number;
                duration: number;
                workPack: import("@earthbucks/lib/dist/work-pack.js").WorkPack;
                shareId: number;
            };
            _output_in: {
                isValidShare: boolean;
                isValidBlock: boolean;
                shareId: number;
                error?: string | undefined;
            };
            _output_out: {
                isValidShare: boolean;
                isValidBlock: boolean;
                shareId: number;
                error?: string | undefined;
            };
        }, unknown>;
    }>;
    userAvatar: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                isBanned: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
            pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                isBanned: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                } | null;
            };
            _input_in: string;
            _input_out: import("@earthbucks/lib/dist/compucha-challenge.js").CompuchaChallenge;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, void>;
    }>;
    userName: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                isBanned: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                } | null;
            };
            _input_in: string;
            _input_out: string;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, Response | undefined>;
    }>;
    buttonConfig: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
        ctx: {
            cookie: string | undefined;
            setHeader: (key: string, value: string) => void;
            pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
            user: {
                id: number;
                pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                createdAt: Date;
                name: string | null;
                avatarId: string | null;
                minPayment: number;
                nSwipes: number;
                nBlocks: number;
                isBanned: boolean;
            } | null;
            completeUserProfile: {
                id: number;
                name: string;
                avatarId: string;
                nSwipes: number;
                pubKeyStr: string;
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
                    pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                    user: {
                        id: number;
                        pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                        createdAt: Date;
                        name: string | null;
                        avatarId: string | null;
                        minPayment: number;
                        nSwipes: number;
                        nBlocks: number;
                        isBanned: boolean;
                    } | null;
                    completeUserProfile: {
                        id: number;
                        name: string;
                        avatarId: string;
                        nSwipes: number;
                        pubKeyStr: string;
                    } | null;
                    sessionTokenId: import("@webbuf/fixedbuf").FixedBuf<16> | null;
                };
                meta: object;
                errorShape: import("@trpc/server").DefaultErrorShape;
                transformer: import("@trpc/server").DefaultDataTransformer;
            }>;
            _meta: object;
            _ctx_out: {
                pubKey: import("@earthbucks/lib/dist/pub-key.js").PubKey | null;
                user: {
                    id: number;
                    pubKey: import("@webbuf/fixedbuf").FixedBuf<33>;
                    createdAt: Date;
                    name: string | null;
                    avatarId: string | null;
                    minPayment: number;
                    nSwipes: number;
                    nBlocks: number;
                    isBanned: boolean;
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
                } | null;
            };
            _input_in: 1 | 2 | 3 | 4;
            _input_out: 1 | 2 | 3 | 4;
            _output_in: number;
            _output_out: number;
        }, unknown>;
    }>;
}>;
export type AppRouter = typeof appRouter;
