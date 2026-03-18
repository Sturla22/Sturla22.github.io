import invoke
import datetime


@invoke.task
def publish(ctx, post):
    """Move a draft into _posts using today's date."""
    ctx.run(f"mv _drafts/{post}.md _posts/{datetime.datetime.now().date()}-{post}.md")


@invoke.task
def hide(ctx, post):
    """Move a published post back into drafts."""
    ctx.run(f"mv _posts/*{post}.md _drafts/{post}.md")


@invoke.task
def serve(ctx):
    """Run the local Jekyll development server."""
    ctx.run("bundle exec jekyll serve -D")
