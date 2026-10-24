import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.slug || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const title = useWatch({ control, name: "title" });
    const previousTitle = useRef(title);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = async (data) => {
        setSubmitError("");
        setIsSubmitting(true);

        try {
            if (!userData?.$id) {
                throw new Error("Your login session is missing. Please log in again.");
            }

            if (post) {
                const image = data.image?.[0];
                const file = image ? await appwriteService.uploadFile(image) : null;
                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...data,
                    featuredImage: file?.$id || post.featuredImage,
                });

                if (!dbPost) {
                    throw new Error("Appwrite did not return the updated post.");
                }

                if (file && post.featuredImage) {
                    await appwriteService.deleteFile(post.featuredImage);
                }

                navigate(`/post/${dbPost.$id}`);
                return;
            }

            const file = await appwriteService.uploadFile(data.image?.[0]);
            const dbPost = await appwriteService.createPost({
                ...data,
                featuredImage: file.$id,
                userId: userData.$id,
            });

            if (!dbPost) {
                throw new Error("Appwrite did not return the created post.");
            }

            navigate(`/post/${dbPost.$id}`);
        } catch (error) {
            console.error("Post form submission failed:", error);
            if (error?.code === 404) {
                setSubmitError("Appwrite returned 404. Check that the project, database, collection, and storage bucket IDs exist in the same Appwrite project.");
            } else {
                setSubmitError(error?.message || "The post could not be saved. Check the browser console for details.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInvalidSubmit = (errors) => {
        const firstError = Object.values(errors).find((error) => error?.message);
        setSubmitError(firstError?.message || "Please complete all required fields before submitting.");
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    useEffect(() => {
        if (title !== previousTitle.current) {
            previousTitle.current = title;
            setValue("slug", slugTransform(title), { shouldValidate: true });
        }
    }, [title, slugTransform, setValue]);

    return (
        <form onSubmit={handleSubmit(submit, handleInvalidSubmit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: "Title is required." })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: "Slug is required." })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: post ? false : "Please select a featured image." })}
                />
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.getFileView(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: "Please select a status." })}
                />
                {submitError && (
                    <p role="alert" className="mb-4 w-full text-sm text-red-600">
                        {submitError}
                    </p>
                )}
                <Button
                    type="submit"
                    bgColor={post ? "bg-green-500" : undefined}
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}