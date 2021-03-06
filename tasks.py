import invoke
import datetime


@invoke.task
def publish(ctx, post):
    ctx.run(f"mv _drafts/{post}.md _posts/{datetime.datetime.now().date()}-{post}.md")


@invoke.task
def hide(ctx, post):
    ctx.run(f"mv _posts/*{post}.md _drafts/{post}.md")
